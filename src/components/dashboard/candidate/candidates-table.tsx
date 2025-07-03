'use client';
import * as React from "react";
import {
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  LinearProgress,
  Button,
  Divider,
  Typography,
  Tooltip,
  TableSortLabel,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Upload as UploadIcon, Download as DownloadIcon } from "@mui/icons-material";
import { MagnifyingGlass as MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { useSelection } from "@/hooks/use-selection";
import { paths } from "@/paths";
import { saveAs } from "file-saver"; // Install via `npm install file-saver`
import { debounce } from '@mui/material/utils';
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface CandidateResponseInfo {
  id: number;
  resume: number;
  skill_id: number;
  name: string;
  grade: string;
  location: string;
  department: string;
  email: string;
  interview_status: string;
}

interface CandidatesTableProps {
  initialPage?: number;
  rowsPerPage?: number;
  status?: string;
  showTranscript?: boolean;
  showAnasysReport?: boolean;
  selectedTab: number;
}

export function CandidatesTable({
  initialPage = 0, showTranscript = false, showAnasysReport = false, selectedTab, status = "ALL" }: CandidatesTableProps): React.JSX.Element {
  const [candidates, setCandidates] = React.useState<CandidateResponseInfo[]>([]);
  const [totalCandidates, setTotalCandidates] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(initialPage);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [scheduleInterviewLoading, setScheduleInterviewLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
  const [order, setOrder] = React.useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = React.useState<keyof CandidateResponseInfo>("id");
  const [downloading, setDownloading] = React.useState<boolean>(false);
  const router = useRouter();
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');


  const fetchCandidatesSearch = async (query: string | string[]) => {
    if (query.length < 1) {
      setCandidates([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
      const response = await fetch(`${paths.urls.candidatesearch}?search_text=${query}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      const data = (await response.json()) as CandidateResponseInfo[];
      setCandidates(data);
    } catch (err) {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = debounce(fetchCandidatesSearch, 300);

  const downloadExcel = async (): Promise<void> => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        setSuccessMessage("Authentication error. Please sign in again.");
        setOpenErrorSnackbar(true);
        setDownloading(false);
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
      // Call the API to get the Excel file
      const response = await fetch(paths.urls.downloadCandidate, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch candidate data.");
      }

      // Read the binary data
      const blob = await response.blob();

      // Save the file using FileSaver.js
      saveAs(blob, "candidates.xlsx");

      setSuccessMessage("Download successful! The file has been saved.");
    } catch (err: unknown) {
      setErrorMessage("Error downloading candidate data.");
    } finally {
      setDownloading(false);
      setOpenSuccessSnackbar(true);
    }
  };

  // Fetch Candidates Data
  React.useEffect(() => {
    const fetchCandidates = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("app_access_token");
        if (!token) {
          await authClient.signOut();
          router.push(paths.auth.signIn);
          window.location.reload();
          return;
        }

        const response = await fetch(
          `${paths.urls.candidate}?page_num=${page + 1}&results_per_page=${rowsPerPage}&interview_status=${status}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          await authClient.signOut();
          router.push(paths.auth.signIn);
          window.location.reload();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch candidates");
        }

        const data = (await response.json()) as { data?: CandidateResponseInfo[]; count?: number };

        setCandidates(Array.isArray(data.data) ? data.data : []);
        setTotalCandidates(typeof data.count === "number" ? data.count : 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void fetchCandidates();
  }, [page, rowsPerPage, status]);

  // Selection hook
  const rowIds = React.useMemo(() => candidates.map((c) => c.id.toString()), [candidates]);
  const { selected, selectAll, deselectAll, toggleSelection } = useSelection(rowIds);

  const selectedSome = selected.size > 0 && selected.size < candidates.length;
  const selectedAll = candidates.length > 0 && selected.size === candidates.length;

  // Handle file upload
  const handleFileUpload = async (candidateId: number, event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("candidate_id", candidateId.toString());
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      const response = await fetch(paths.urls.resume, {
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
        const errorData = (await response.json()) as { message?: string };
        throw new Error(errorData.message || "Failed to upload resume");
      }

      setSuccessMessage("Resume uploaded successfully!");
      setOpenSuccessSnackbar(true);

      setCandidates((prevCandidates) =>
        prevCandidates.map((candidate) => (candidate.id === candidateId ? { ...candidate, resume: 1 } : candidate))
      );
    } catch (err) {
      setErrorMessage("Failed to upload resume");
      setOpenErrorSnackbar(true);
    }
  };

  // Handle resume download
  const handleDownloadResume = async (candidateId: number) => {
    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
      const response = await fetch(`${paths.urls.resume}?candidate_id=${candidateId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
      if (response.status === 403) throw new Error("You are not authorized to download this resume.");
      if (response.status === 404) throw new Error("No resume found for the given candidate ID.");
      if (!response.ok) throw new Error(`Failed to download resume : ${response.statusText}`);

      console.log("download response", response);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_${candidateId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccessMessage("Resume downloaded successfully!");
      setOpenSuccessSnackbar(true);
    } catch (err: unknown) {
      setErrorMessage("Failed to download resume");
      setOpenErrorSnackbar(true);
    }
  };

  // Handle transcript download
  const handleTranscript = async (candidateId: number) => {
    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        setErrorMessage("No access token found. Please sign in again.");
        setOpenErrorSnackbar(true);
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      const response = await fetch(`${paths.urls.transcriptDownload}?candidate_id=${candidateId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      if (response.status === 403) {
        setErrorMessage("Access denied. You do not have permission to download this transcript.");
        setOpenErrorSnackbar(true);
        throw new Error("Access denied.");
      }

      if (response.status === 404) {
        setErrorMessage("No transcript found for the selected candidate.");
        setOpenErrorSnackbar(true);
        throw new Error("Not found.");
      }

      if (!response.ok) {
        setErrorMessage(`Failed to download zip: ${response.statusText}`);
        setOpenErrorSnackbar(true);
        throw new Error("Download failed.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${candidateId}_documents.zip`; // ✅ Updated filename to match backend

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);

      setSuccessMessage("Documents downloaded successfully!");
      setOpenSuccessSnackbar(true);
    } catch (err: unknown) {
      console.error("Download error:", err);
      if (!openErrorSnackbar) setOpenErrorSnackbar(true); // Fallback if not already shown
    }
  };

  // handle anasys report download
  const handleAnasysReport = async (candidateId: number) => {
    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        setErrorMessage("No access token found. Please sign in again.");
        setOpenErrorSnackbar(true);
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      const response = await fetch(`${paths.urls.anasysReportDownload}?candidate_id=${candidateId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("backend response ", response);
      console.log("backend status  ", response.status);

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      if (response.status === 403) {
        setErrorMessage("Access denied. You do not have permission to download this analysis report.");
        setOpenErrorSnackbar(true);
        throw new Error("Access denied.");
      }

      if (response.status === 404) {
        setErrorMessage("No analysis report found for the selected candidate.");
        setOpenErrorSnackbar(true);
        throw new Error("Not found.");
      }

      if (!response.ok) {
        setErrorMessage(`Failed to download report: ${response.statusText}`);
        setOpenErrorSnackbar(true);
        throw new Error("Failed response.");
      }

      const blob = await response.blob();
      console.log("Blob type:", blob.type);
      console.log("Blob size:", blob.size);

      // Ensure the response is actually a PDF
      if (blob.type !== "application/pdf") {
        setErrorMessage("Invalid file format received. Expected a PDF.");
        setOpenErrorSnackbar(true);
        throw new Error("Invalid format.");
      }

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `analysis_report_${candidateId}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a); // ✅ Cleanup

      window.URL.revokeObjectURL(url); // ✅ Free up memory

      setSuccessMessage("Analysis report downloaded successfully!");
      setOpenSuccessSnackbar(true);
    } catch (err: unknown) {
      console.error("Download error:", err);
      if (!openErrorSnackbar) setOpenErrorSnackbar(true); // fallback to show snackbar if not already set
    }
  };

  // Sorting function
  const handleSort = (property: keyof CandidateResponseInfo | "resume") => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort the candidates array based on the selected column
  const sortedCandidates = React.useMemo(() => {
    return [...candidates].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Convert numbers to string for uniform comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return order === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });
  }, [candidates, order, orderBy]);

  const handleScheduleInterview = async (): Promise<void> => {
    if (selected.size === 0) {
      setErrorMessage("Please select at least one candidate to schedule an interview.");
      setOpenErrorSnackbar(true);
      return;
    }

    setScheduleInterviewLoading(true); // Start loading when request begins

    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      const candidateIdList = Array.from(selected).map(id => Number(id));
      const requestBody = JSON.stringify({ id_list: candidateIdList });

      console.log("Request Payload:", requestBody);

      const response = await fetch(paths.urls.scheduleInterview, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      interface ErrorData {
        message?: string;
      }

      // Check for non-OK responses
      if (!response.ok) {
        const errorData: ErrorData = (await response.json()) as ErrorData;
        setErrorMessage(errorData.message || "An error occurred while scheduling interviews.");
        setOpenErrorSnackbar(true);
        return;
      }

      // Define the expected response structure
      interface ScheduleInterviewResponse {
        message?: string;
      }

      // Parse response with type assertion
      const responseData = (await response.json()) as ScheduleInterviewResponse;

      // Check for backend-specific error messages
      if (responseData.message?.includes("JD or resume or questionnaire not found")) {
        setErrorMessage(responseData.message); // Set error message from backend
        setOpenErrorSnackbar(true); // Open error snackbar
        return; // Stop further execution
      }

      // Check if response contains a message
      setSuccessMessage(responseData.message ?? "Interview scheduling completed, but no message was provided.");
      setOpenSuccessSnackbar(true); // Show success snackbar

    } catch (err: unknown) {
      console.error("Error scheduling interviews:", err);

      // Only set the error message if there is an error
      setErrorMessage(err instanceof Error ? err.message : "An error occurred while scheduling interviews. Please try again.");

      // Open the error snackbar only when there is an error message
      if (errorMessage) {
        setOpenErrorSnackbar(true);
      }
    } finally {
      setScheduleInterviewLoading(false); // Stop loading once the request is complete
    }
  };

  return (
    <>
      <Card sx={{ p: 3, backgroundColor: 'white', borderRadius: '10px', boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Poppins, sans-serif' }}>
          Selected: {selected.size}/{totalCandidates}
        </Typography>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* Search Input */}
          <Autocomplete
            freeSolo
            options={candidates}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            onInputChange={(_, value) => debouncedFetch(value)}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search Candidate"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: loading ? <CircularProgress size={15} /> : null,
                }}
                sx={{
                  '& .MuiInputBase-root': { height: 42, paddingRight: 1, },
                  '& input': { padding: '8px 10px', },
                }}
              />
            )}
            sx={{
              width: '300px', fontFamily: 'Poppins, sans-serif', fontWeight: 700,
            }}
          />

          {/* Action Buttons */}
          <Button
            variant="contained"
            color="primary"
            disabled={selected.size === 0 || !(selectedTab === 0 || selectedTab === 1 || selectedTab === 2 || selectedTab === 3) || scheduleInterviewLoading}
            onClick={handleScheduleInterview}
            sx={{ minWidth: '180px', position: 'relative', fontFamily: 'Poppins, sans-serif', backgroundColor: '#521fc9', color: '#fff', '&:hover': { backgroundColor: '#521fc9' } }}

          >
            {scheduleInterviewLoading ?
              <CircularProgress size={24} color="inherit" /> :
              "Schedule Interview"
            }
          </Button>
          {/* variant="outlined" */}
          <Button variant="contained" onClick={downloadExcel} disabled={downloading} sx={{
            backgroundColor: '#521fc9', color: '#fff', '&:hover': {
              backgroundColor: '#521fc9',
            },
            fontFamily: 'Poppins, sans-serif',
          }}
          >
            {downloading ? (
              <CircularProgress size={20} color="inherit" sx={{ fontFamily: 'Poppins, sans-serif' }} />
            ) : (
              'Download Excel'
            )}
          </Button>

        </Box>

        {/* Error Message */}
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

        {/* Loading Indicator */}
        {loading && <LinearProgress sx={{ mt: 2 }} />}

        {/* Table Container */}
        <Box sx={{ overflowX: 'auto', mt: 2 }}>
          <Table
            sx={{
              backgroundColor: '#fff',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif',
                    padding: '6px 8px',
                    fontSize: '12px',
                  }}
                >
                  <Checkbox
                    checked={selectedAll}
                    indeterminate={selectedSome}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                  />
                </TableCell>
                {[
                  { label: 'Id', field: 'id' },
                  { label: 'Name', field: 'name' },
                  { label: 'Email', field: 'email' },
                  { label: 'Location', field: 'location' },
                  { label: 'Department', field: 'department' },
                  { label: 'Grade', field: 'grade' },
                  { label: 'Status', field: 'interview_status' },
                ].map(({ label, field }) => (
                  <TableCell
                    key={field}
                    sx={{
                      textAlign: 'left',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      color: " #B1B1B1",
                      backgroundColor: '#fff', // ensures white background
                      padding: '6px 8px',
                      //borderBottom: '1px solid #f0f1f5', // Add this
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === field}
                      direction={orderBy === field ? order : 'asc'}
                      onClick={() => {
                        handleSort(field as keyof CandidateResponseInfo);
                      }}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    padding: '6px 8px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    color: " #B1B1B1",
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  RESUME
                </TableCell>
                {showTranscript && (<TableCell
                  sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    padding: '6px 8px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    color: " #B1B1B1",
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  REPORT
                </TableCell>)}
                {showTranscript && (<TableCell
                  sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    padding: '6px 8px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    color: "#B1B1B1",
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  TRANSCRIPT
                </TableCell>)}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedCandidates.map((candidate) => (
                <TableRow key={candidate.id} sx={{ backgroundColor: 'white' }}>
                  <TableCell padding="checkbox" sx={{ textAlign: 'left', padding: '6px 8px' }}>
                    <Checkbox
                      checked={selected.has(candidate.id.toString())}
                      onChange={() => { toggleSelection(candidate.id.toString()) }}
                    />
                  </TableCell >
                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px', }}>{candidate.id}</TableCell>
                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px', }}>{candidate.name}</TableCell>
                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px', }}>{candidate.email}</TableCell>
                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px', }}>{candidate.location}</TableCell>
                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px', }}>{candidate.department}</TableCell>
                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px', }}>{candidate.grade}</TableCell>
                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px' }}>
                    <span
                      style={{
                        backgroundColor:
                          candidate.interview_status === 'Successful' || candidate.interview_status === 'Completed'
                            ? '#d1fae5'
                            : candidate.interview_status === 'Canceled'
                              ? '#fee2e2'
                              : candidate.interview_status === 'In Progress'
                                ? '#dbeafe'
                                : '#fef3c7', // Pending / Scheduled
                        color:
                          candidate.interview_status === 'Successful' || candidate.interview_status === 'Completed'
                            ? '#10b981'
                            : candidate.interview_status === 'Canceled'
                              ? '#ef4444'
                              : candidate.interview_status === 'In Progress'
                                ? '#3b82f6'
                                : '#f97316',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontWeight: 600,
                        fontSize: '12px',
                        display: 'inline-block',
                        textAlign: 'center',
                      }}
                    >
                      {candidate.interview_status}
                    </span>
                  </TableCell>

                  <TableCell sx={{ textAlign: 'left', padding: '6px 8px', fontSize: '12px', }}>
                    {candidate.resume === 0 ? (
                      <Tooltip title="Upload Resume in doc, docx and pdf format">
                        <Button
                          component="label"
                          sx={{
                            fontSize: '12px',
                            textTransform: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            padding: '4px 6px',
                            minHeight: '32px',
                            minWidth: 'auto', // prevents default min-width
                          }}
                        >
                          <UploadIcon fontSize="small" />
                          <input
                            type="file"
                            accept=".doc,.docx,.pdf"
                            hidden
                            onChange={(event) => void handleFileUpload(candidate.id, event)}
                          />
                        </Button>
                      </Tooltip>


                    ) : (
                      <Tooltip title="Download Resume">
                        <Button
                          onClick={() => handleDownloadResume(candidate.id)}
                          sx={{
                            fontSize: '12px',
                            textTransform: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            padding: '4px 6px',
                            minHeight: '32px',
                            minWidth: 'auto', // prevents default min-width
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    )}
                  </TableCell>
                  {showAnasysReport && (
                    <TableCell sx={{ textAlign: 'center', padding: '6px 8px' }}>
                      <Tooltip title="Download Analysis Report">
                        <Button
                          onClick={() => handleAnasysReport(candidate.id)}
                          sx={{
                            fontSize: '12px',
                            textTransform: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            padding: '4px 6px',
                            minHeight: '32px',
                            minWidth: 'auto', // prevents default min-width
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </Button>
                      </Tooltip>

                    </TableCell>
                  )}
                  {showTranscript && (
                    <TableCell sx={{ textAlign: 'center', padding: '6px 8px' }}>
                      <Tooltip title="Download Transcript in ZIP">
                        <Button
                          onClick={() => handleTranscript(candidate.id)}
                          sx={{
                            fontSize: '12px',
                            textTransform: 'none',
                            fontFamily: 'Poppins, sans-serif',
                            padding: '4px 6px',
                            minHeight: '32px',
                            minWidth: 'auto', // prevents default min-width
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </Button>
                      </Tooltip>

                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Pagination */}
        <Divider sx={{ my: 0 }} />
        <TablePagination
          component="div"
          count={totalCandidates}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => { setPage(newPage) }}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
        />
      </Card>

      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={3000}
        onClose={() => { setOpenSuccessSnackbar(false) }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => { setOpenSuccessSnackbar(false) }}
          severity="success"
          variant="standard"
          sx={{ width: '100%' }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={3000}
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
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}




