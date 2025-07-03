'use client';
import * as React from 'react';
import {
  Button,
  Stack,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogContent,
} from '@mui/material';
import { UploadSimple as UploadIcon } from '@phosphor-icons/react/dist/ssr/UploadSimple';
import { paths } from '@/paths';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';  // ✅ just import Alert directly
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from '@mui/icons-material/Error';
import { authClient } from '@/lib/auth/client';
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { CellObject } from 'xlsx';


export function BulkProfileUpload(): React.JSX.Element {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedBulkResumeFile, setSelectedBulkResumeFile] = React.useState<File | null>(null);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [modalMessage, setModalMessage] = React.useState<string[]>([]);
  //const fileInputRef = React.useRef<HTMLInputElement>(null); // ✅ Added ref for file input
  const profileInputRef = React.useRef<HTMLInputElement>(null);
  const resumeInputRef = React.useRef<HTMLInputElement>(null);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false); // For success
  const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);     // For error
  const [errorMessage, setErrorMessage] = React.useState("");                  // For error message
  const [isUploading, setIsUploading] = React.useState(false);                 // For spinner
  const [successMessage, setSuccessMessage] = React.useState<string>("");
  const router = useRouter();
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = React.useState<string>(""); // For file name
  const [isDownloadReady, setIsDownloadReady] = React.useState<boolean>(false); // To control whether the download link is enabled
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false); const downloadSampleExcel = () => {

    const data = [
      { NAME: 'Sai', GRADE: "P5", LOCATION: "Hyderabad", SKILL: "Java", DESIGNATION: "Software Engineer", DEPARTMENT: "Engineer", EMAIL: 'saisanath@ykinnosoft.com', },
      { NAME: 'Gowtham', GRADE: "P5", LOCATION: "Chennai", SKILL: "Python", DESIGNATION: "Software Engineer", DEPARTMENT: "Engineer", EMAIL: 'gowtham@ykinnosoft.com', }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    data.forEach((item, index) => {
      const cellAddress = `G${index + 2}`; // G is EMAIL column, +2 for header row
      (worksheet[cellAddress] as CellObject).l = { Target: `mailto:${item.EMAIL}` };
    });
    // Set column widths (optional, for better spacing)
    worksheet['!cols'] = [
      { wch: 15 }, // NAME
      { wch: 10 }, // GRADE
      { wch: 15 }, // LOCATION
      { wch: 10 }, // SKILL
      { wch: 22 }, // DESIGNATION
      { wch: 15 }, // DEPARTMENT
      { wch: 30 }, // EMAIL
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Profiles');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    }) as ArrayBuffer;
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'ProfileUploadTemplate.xlsx');
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    console.log(setDownloadFileName);
    setSelectedFile(file);
  };

  const handleBulkResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedBulkResumeFile(event.target.files[0]);
    }
  };

  interface ValidationError {
    msg: string;
  }

  interface ErrorResponse {
    detail?: string | ValidationError[];
  }

  interface ErrorDetail {
    msg: string;
  }


  const handleBulkResumeUpload = async (): Promise<void> => {
    if (!selectedBulkResumeFile) {
      setModalMessage(["❌ No file selected. Please choose a .zip file."]);
      setOpenModal(true);
      return;
    }

    const isZip = selectedBulkResumeFile.name.toLowerCase().endsWith(".zip");
    if (!isZip) {
      setModalMessage(["❌ Invalid file format. Only .zip files are supported."]);
      setOpenModal(true);
      return;
    }

    const token = localStorage.getItem("app_access_token");
    if (!token) {
      setModalMessage(["Authentication error. Please sign in again."]);
      setOpenModal(true);
      await authClient.signOut();
      router.push(paths.auth.signIn);
      window.location.reload();
      return;
    }

    const formData = new FormData();
    formData.append("bulk_resume", selectedBulkResumeFile);

    try {
      const response = await fetch(paths.urls.bulkResumeUpload, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      if (!response.ok) {
        let errorMessages = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = (await response.json()) as ErrorResponse;

          if (response.status === 400 && Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail
              .map((err) => `❌ ${err.msg}`)
              .join("\n");

            errorMessages = validationErrors || "Invalid input. Please check your file.";
          } else if (typeof errorData.detail === "string") {
            errorMessages = `❌ ${errorData.detail}`;
          }
        } catch (jsonError) {
          console.warn("Failed to parse error response:", jsonError);
        }

        throw new Error(errorMessages);
      }

      interface SuccessResponse {
        invalid_filenames?: string[];
        invalid_extensions?: string[];
        invalid_mime_types?: string[];
        upload_failures?: string[];
        successful_uploads?: string[];
      }

      const result = (await response.json()) as SuccessResponse;
      console.log(successMessage);
      const formatList = (label: string, items?: string[]) =>
        items?.length
          ? `✅ ${label} (${items.length}):\n- ${items.join("\n- ")}`
          : "";

      let summaryLines: string[] = [];

      summaryLines.push("📦 Bulk Upload Summary:");
      if (result.successful_uploads?.length) summaryLines.push(formatList("Successful Uploads", result.successful_uploads));
      if (result.invalid_filenames?.length) summaryLines.push(formatList("Invalid Filenames", result.invalid_filenames));
      if (result.invalid_extensions?.length) summaryLines.push(formatList("Invalid Extensions", result.invalid_extensions));
      if (result.invalid_mime_types?.length) summaryLines.push(formatList("Invalid MIME Types", result.invalid_mime_types));
      if (result.upload_failures?.length) summaryLines.push(formatList("Upload Failures", result.upload_failures));

      if (summaryLines.length === 1) { // Only title, no details
        summaryLines.push("⚠️ No files were processed.");
      }

      setModalMessage(summaryLines);
    } catch (error: unknown) {
      console.error("Upload error:", error);
      if (error instanceof Error) {
        setModalMessage([error.message]);
      } else {
        setModalMessage(["An unknown error occurred. Please try again."]);
      }
    }

    setOpenModal(true);
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      setErrorMessage("Please select a file first.");
      setOpenErrorSnackbar(true);
      return;
    }

    const token = localStorage.getItem("app_access_token");
    if (!token) {
      setErrorMessage("Authentication error. Please sign in again.");
      setOpenErrorSnackbar(true);
      await authClient.signOut();
      router.push(paths.auth.signIn);
      window.location.reload();
      return;
    }

    const formData = new FormData();
    formData.append("bulk_profile", selectedFile);

    try {
      setIsUploading(true);
      const response = await fetch(paths.urls.bulkprofile, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      if (response.status === 400) {
        let errorMessageResult = "Invalid file format. Please upload a valid .zip file.";

        try {
          const errorData = (await response.json()) as ErrorResponse;

          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessageResult = errorData.detail.map((d: ErrorDetail) => d.msg).join(", ");
            } else {
              errorMessageResult = errorData.detail;
            }
          }
        } catch (err) {
          console.warn("Could not parse backend error JSON", err);
        }

        setErrorMessage(errorMessageResult);
        setOpenErrorSnackbar(true);
        return;
      }

      if (response.status === 201 || response.status === 200) {
        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob); // Create a blob URL for download
        setDownloadUrl(fileUrl); // Store the blob URL in state
        setIsDownloadReady(true);  // Enable the download link
        setSuccessMessage("Bulk upload processed successfully! Ready to download. ✅");
        setOpenSuccessSnackbar(true);

        if (profileInputRef.current) {
          profileInputRef.current.value = ""; // 🛠 Clear file input manually
        }
        setSelectedFile(null); // Clear selected file        
      } else {
        interface ErrorData {
          detail?: string | { msg: string }[];
        }

        let errorMessageResult = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData: ErrorData = (await response.json()) as ErrorData;
          if (errorData?.detail) {
            errorMessageResult = Array.isArray(errorData.detail)
              ? errorData.detail.map((d) => d.msg).join(", ")
              : errorData.detail;
            console.log(errorMessageResult)
          }
        } catch (err) {
          console.error("Failed to parse error data", err);
        }
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred.");
      setOpenErrorSnackbar(true);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle the download process
  const handleDownload = () => {
    if (!downloadUrl || isDownloading) {
      return;  // Prevent download if already in progress or if downloadUrl is not set
    }

    setIsDownloading(true);  // Mark as downloading

    // Create the download link
    const link = document.createElement("a");

    // Make sure the file name is set correctly
    link.href = downloadUrl;
    link.download = downloadFileName || "bulk_profiles_processed.xlsx"; // Ensure the correct filename is used

    // Simulate a click to trigger the download
    link.click();

    // Reset download state after triggering the download
    setIsDownloadReady(false);  // Disable the download link
    setIsDownloading(false);  // Reset the downloading state to allow future downloads
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
    setModalMessage([]);
    setSelectedFile(null); // ✅ Reset file selection
    setSelectedBulkResumeFile(null);

    // ✅ Reset both file input values
    if (profileInputRef.current) profileInputRef.current.value = '';
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  return (
    <Grid
      container
      spacing={4}
      justifyContent="center"
      sx={{ minHeight: '100%', p: 4, borderRadius: 3 }}
    >
      {/* Single Profile Section */}
      <Grid item xs={12} md={6}>
        <Paper
          variant="outlined"
          sx={{
            padding: 3,
            //border: '2px dashed #bbb',
            borderRadius: 3,
            textAlign: 'center',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.3s ease-in-out',
            '&:hover': { boxShadow: 3, borderColor: '#40189d' },
          }}
        >
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#333', fontFamily: ['Poppins', 'sans-serif'] }}>
            Bulk Profile Upload
          </Typography>
          <Stack spacing={2} alignItems="center">
            {/* Upload Icon */}
            <UploadIcon size={50} color="#40189d" />

            {/* File Input */}

            <input
              ref={profileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="bulk-file-upload"
            />

            {/* Choose File Button */}
            <label htmlFor="bulk-file-upload">
              <Button component="span" variant="contained" size="small" sx={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, backgroundColor: '#40189d',
                '&:hover': {
                  backgroundColor: '#311270', // <-- Change this to your desired hover color
                },
              }}>
                Choose File
              </Button>
            </label>

            {/* Allowed Formats Note */}
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Allowed formats: <strong>xlsx</strong>
            </Typography>


            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}
            >
              Sample file format: <strong>xlsx</strong>{' '}
              <span
                onClick={downloadSampleExcel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') downloadSampleExcel();
                }}
                role="button"
                tabIndex={0}
                style={{
                  textDecoration: 'underline',
                  marginLeft: 8,
                  cursor: 'pointer',
                  color: '#1976d2',
                }}
              >
                Download sample
              </span>
            </Typography>

            {/* Show Selected File Name */}
            {selectedFile && (
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
            {/* Upload Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              sx={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, backgroundColor: '#40189d',
                '&:hover': {
                  backgroundColor: '#311270', // <-- Change this to your desired hover color
                },
              }}
              startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            {isDownloadReady && !isDownloading && (
              <Typography variant="body2" sx={{ marginTop: 2 }}>
                <button
                  onClick={(e) => {
                    if (!isDownloadReady) {
                      e.preventDefault();
                    } else {
                      handleDownload();
                    }
                  }}
                  style={{
                    color: isDownloadReady ? "#1976d2" : "#ccc",
                    textDecoration: "underline",
                    pointerEvents: isDownloadReady && !isDownloading ? "auto" : "none",
                    cursor: isDownloadReady && !isDownloading ? "pointer" : "not-allowed",
                    background: "none",
                    border: "none",
                    padding: "0",
                  }}
                >
                  Download {downloadFileName || "bulk_profiles_processed.xlsx"}
                </button>
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Bulk Profile Upload */}
      <Grid item xs={12} md={6}>
        <Paper
          variant="outlined"
          sx={{
            padding: 3,
            //border: "2px dashed #bbb",
            borderRadius: 3,
            textAlign: "center",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            transition: "all 0.3s ease-in-out",
            "&:hover": { boxShadow: 3, borderColor: "#40189d" },
          }}
        >
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#333", fontFamily: ['Poppins', 'sans-serif'] }}
          >
            Bulk Resume Upload
          </Typography>
          <Stack spacing={2} alignItems="center">
            <UploadIcon size={50} color="#40189d" />

            {/* File Input */}
            <input
              ref={resumeInputRef}
              type="file"
              accept=".zip"
              onChange={handleBulkResumeFileChange}
              style={{ display: 'none' }}
              id="bulk-resume-upload"
            />

            {/* Choose File Button */}
            <label htmlFor="bulk-resume-upload">
              <Button component="span" variant="contained" size="small" sx={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, backgroundColor: '#40189d',
                '&:hover': {
                  backgroundColor: '#311270', // <-- Change this to your desired hover color
                },
              }}>
                Choose File
              </Button>
            </label>

            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Allowed formats: <strong>.zip</strong>
            </Typography>

            {/* Show Selected File Name */}
            {selectedBulkResumeFile && (
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                Selected file: {selectedBulkResumeFile.name}
              </Typography>
            )}

            {/* Upload Button */}

            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkResumeUpload}
              disabled={!selectedBulkResumeFile}
              sx={{
                fontFamily: 'Poppins, sans-serif', fontWeight: 700, backgroundColor: '#40189d',
                '&:hover': {
                  backgroundColor: '#311270', // <-- Change this to your desired hover color
                },
              }}
            >
              Upload
            </Button>

          </Stack>
        </Paper>

        {/* ✅ Success Snackbar */}
        <Snackbar
          open={openSuccessSnackbar} // ✅ CORRECT
          autoHideDuration={10000}
          onClose={() => { setOpenSuccessSnackbar(false) }} // ✅
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => { setOpenSuccessSnackbar(false) }} // ✅
            severity="success"
            variant="standard"
            sx={{ width: '100%' }}
            iconMapping={{
              success: <CheckCircleIcon fontSize="inherit" />
            }}
          >
            Bulk Profiles Uploaded Successfully! {/* ✅ */}
          </Alert>
        </Snackbar>

        <Snackbar
          open={openErrorSnackbar}
          autoHideDuration={10000}
          onClose={() => { setOpenErrorSnackbar(false) }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => { setOpenErrorSnackbar(false) }}
            severity="error"
            variant="standard"
            sx={{ width: '100%' }}
            iconMapping={{
              error: <ErrorIcon fontSize="inherit" />
            }}
          >
            {/*❌*/} {errorMessage}
          </Alert>
        </Snackbar>
      </Grid>

      {/* Upload Status Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogContent
          style={{
            textAlign: 'center',
            padding: '2rem',
            maxHeight: '500px', // Set a maximum height for the modal content
            overflowY: 'auto'   // Make it scrollable if content exceeds the max height
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <CheckCircleIcon style={{ fontSize: 60, color: '#4CAF50' }} />
          </div>

          <Typography variant="h5" style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
            Good job!
          </Typography>

          {/* Loop through the message array */}
          {Array.isArray(modalMessage) ? (
            modalMessage.map((line, index) => (
              <Typography key={index} variant="body1" color="textSecondary" style={{ marginBottom: '0.5rem', whiteSpace: 'pre-line' }}>
                {line}
              </Typography>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary" style={{ marginBottom: '2rem', whiteSpace: 'pre-line' }}>
              {modalMessage}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleCloseModal}
            style={{
              backgroundColor: '#7D4AEA',
              color: 'white',
              borderRadius: '8px',
              padding: '0.5rem 2rem',
              textTransform: 'none',
            }}
          >
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}