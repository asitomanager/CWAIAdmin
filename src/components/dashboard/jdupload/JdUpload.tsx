'use client';

import * as React from 'react';
import {
  Button, FormControl, InputLabel, Select, MenuItem, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Typography,
  Paper,
  Stack,
  IconButton
} from '@mui/material';
import { paths } from '@/paths';
import { UploadSimple as UploadIcon } from '@phosphor-icons/react/dist/ssr/UploadSimple';
import DownloadIcon from '@mui/icons-material/Download'; // Import download icon
import { useRouter } from "next/navigation";
import { authClient } from '@/lib/auth/client';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';  // ✅ just import Alert directly
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export function JdUpload(): React.JSX.Element {
  const [selectedJDFile, setSelectedJDFile] = React.useState<File | null>(null);
  const [selectedSkill, setSelectedSkill] = React.useState('');
  const [selectedDesignation, setSelectedDesignation] = React.useState('');
  const [designations, setDesignations] = React.useState<string[]>([]);
  const [skills, setSkills] = React.useState<string[]>([]);
  const [loadingDesignations, setLoadingDesignations] = React.useState(true);
  const [loadingSkills, setLoadingSkills] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [selectedQBFile, setSelectedQBFile] = React.useState<File | null>(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');
  const fileInputRefJD = React.useRef<HTMLInputElement | null>(null);
  const fileInputRefQB = React.useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false);
const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);
const [errorMessage, setErrorMessage] = React.useState('');
const [snackbarMessage, setSnackbarMessage] = React.useState('');

  React.useEffect(() => {
    const fetchDesignations = async (): Promise<void> => {
      setLoadingDesignations(true);
      const token = localStorage.getItem('app_access_token');
      if (!token) {
        setLoadingDesignations(false);
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
      try {
        const response = await fetch(`${paths.urls.lov}?lov_name=designation`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (response.status === 401) {
          await authClient.signOut();
          router.push(paths.auth.signIn);
          window.location.reload();
          return;
        }

        const data: string[] = (await response.json()) as string[]; // ✅ Explicitly type the response
        if (Array.isArray(data)) {
          setDesignations(data);
        }
      } catch (err) {
        setLoadingDesignations(false);
      } finally {
        setLoadingDesignations(false);
      }
    };
    void fetchDesignations();
  }, []);

  React.useEffect(() => {
    const fetchSkills = async (): Promise<void> => {
      setLoadingSkills(true);
      const token = localStorage.getItem('app_access_token');
      if (!token) {
        setLoadingSkills(false);
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
      try {
        const response = await fetch(`${paths.urls.lov}?lov_name=skill`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (response.status === 401) {
          await authClient.signOut();
          router.push(paths.auth.signIn);
          window.location.reload();
          return;
        }

        const data: string[] = (await response.json()) as string[]; // ✅ Explicitly type the response
        if (Array.isArray(data)) {
          setSkills(data);
        }
      } catch (err) {
        setLoadingSkills(false);
      } finally {
        setLoadingSkills(false);
      }
    };
    void fetchSkills();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'jd' | 'qb') => {
    if (event.target.files && event.target.files.length > 0) {
      if (type === 'jd') setSelectedJDFile(event.target.files[0]);
      if (type === 'qb') setSelectedQBFile(event.target.files[0]);
    }
  }

  const handleUpload = async (): Promise<void> => {
    if (!selectedSkill) {
      setErrorMessage('Please select skill.');
      setOpenErrorSnackbar(true);
      return;
    }

    if (!selectedDesignation) {
      setErrorMessage('Please select designation.');
      setOpenErrorSnackbar(true);
      return;
    }

    if (!selectedJDFile || !selectedQBFile) {
      setErrorMessage('Please select both JD and Question Bank files.');
      setOpenErrorSnackbar(true);
      return;
    }

    const token = localStorage.getItem('app_access_token');
    if (!token) {
      setErrorMessage('Authentication error. Please sign in again.');
      setOpenErrorSnackbar(true);
      await authClient.signOut();
      router.push(paths.auth.signIn);
      window.location.reload();
      return;
    }

    setUploading(true);

    try {
      const jdFormData = new FormData();
      jdFormData.append('jd', selectedJDFile);
      jdFormData.append('skill', selectedSkill);
      jdFormData.append('designation', selectedDesignation);

      const jdResponse = await fetch(paths.urls.jdupload, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: jdFormData,
      });

      if (jdResponse.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      const jdResult: { message?: string } = (await jdResponse.json()) as { message?: string }; // ✅ Explicit type

      const qbFormData = new FormData();
      qbFormData.append('question_bank', selectedQBFile);
      qbFormData.append('skill', selectedSkill);
      qbFormData.append('designation', selectedDesignation);

      const qbResponse = await fetch(paths.urls.qaupload, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: qbFormData,
      });

      if (qbResponse.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      const qbResult: { message?: string } = (await qbResponse.json()) as { message?: string }; // ✅ Explicit type
      if (qbResponse.ok) {
        setSnackbarMessage(`JD ${jdResult.message || ''} and Questionnaire ${qbResult.message || ''}`);
        setOpenSuccessSnackbar(true);
        setSelectedSkill("");
        setSelectedDesignation("");
        setSelectedJDFile(null);
        setSelectedQBFile(null);
        setUploading(false);
        // Clear file input values
        if (fileInputRefJD.current) fileInputRefJD.current.value = "";
        if (fileInputRefQB.current) fileInputRefQB.current.value = "";
      } else {
        setErrorMessage('Error uploading Question Bank.');
        setOpenErrorSnackbar(true);
      }
    } catch (err) {
      setErrorMessage('An error occurred during the upload.');
      setOpenErrorSnackbar(true);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    // Reset all state variables
    setSelectedSkill("");
    setSelectedDesignation("");
    setSelectedJDFile(null);
    setSelectedQBFile(null);
    setUploading(false);
    setModalMessage("");
  
    // Clear file input values
    if (fileInputRefJD.current) fileInputRefJD.current.value = "";
    if (fileInputRefQB.current) fileInputRefQB.current.value = "";
  
    // Close the modal
    setOpenModal(false);
  };  

  return (
    <Grid
      container
      spacing={1}
      justifyContent="centre"
      sx={{ minHeight: '100%', p: 2, borderRadius: 2,fontFamily: 'Poppins, sans-serif',backgroundColor: "#fff",marginTop:"2px",paddingLeft: '13px',
    paddingRight: '22px', }}
    >
      {/* Skill & Designation Dropdowns */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth required>
              <InputLabel sx={{fontFamily: 'Poppins, sans-serif'}}>Skill</InputLabel>
              <Select
                value={selectedSkill}
                onChange={(e) => {setSelectedSkill(e.target.value)}}
                label="Skill"
              >
                {loadingSkills ? (
                  <MenuItem disabled>
                    <CircularProgress size={24} />
                  </MenuItem>
                ) : (
                  skills.map((skill, index) => (
                    <MenuItem key={index} value={skill}>
                      {skill}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth required disabled={loadingDesignations}>
              <InputLabel sx={{fontFamily: 'Poppins, sans-serif'}}>Designation</InputLabel>
              <Select
                value={selectedDesignation}
                onChange={(e) => {setSelectedDesignation(e.target.value)}}
                label="Designation"
              >
                {loadingDesignations ? (
                  <CircularProgress size={24} sx={{ margin: 'auto' }} />
                ) : (
                  designations.map((designation, index) => (
                    <MenuItem key={index} value={designation}>
                      {designation}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>

      {/* JD Upload */}
      <Grid item xs={6}>
        <Paper
          variant="outlined"
          sx={{
            padding: 3,
            //border: '2px dashed #bbb',
            borderRadius: 3,
            textAlign: 'center',
            transition: 'all 0.3s ease-in-out',
            '&:hover': { boxShadow: 3, borderColor: '#40189d'}
          }}
        >
          <Typography variant="h6" align="center" sx={{ fontWeight:600, color: '#333',fontFamily: ['Poppins', 'sans-serif'] }}>
          JD Upload
        </Typography>
          <Stack spacing={1} alignItems="center">
            <UploadIcon size={50} color="#40189d" />
            {/* <Typography variant="body1" sx={{fontFamily: 'Poppins, sans-serif'}}>Click to Upload</Typography> */}
            <input
              ref={fileInputRefJD}
              type="file"
              accept=".docx"
              onChange={(e) => {handleFileChange(e, 'jd')}}
              style={{ display: 'none' }}
              id="jd-upload"
            />
            <label htmlFor="jd-upload">
              <Button component="span" variant="contained" size="small" sx={{fontFamily: 'Poppins, sans-serif', backgroundColor: '#40189d',
                '&:hover': {
                  backgroundColor: '#311270', // <-- Change this to your desired hover color
                },}}>
                Choose File
              </Button>
            </label>

            {/* Allowed Formats Note */}
            <Typography variant="caption" color="text.secondary" sx={{fontFamily: 'Poppins, sans-serif'}}>
              Allowed formats: <strong>.docx</strong>
            </Typography>

            {/* JD File Download Button */}
            {selectedJDFile && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="textSecondary" sx={{fontFamily: 'Poppins, sans-serif'}}>
                  {selectedJDFile.name}
                </Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    const url = URL.createObjectURL(selectedJDFile);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = selectedJDFile.name; // Set file name for download
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Question Bank Upload */}
      <Grid item xs={6}>
        <Paper
          variant="outlined"
          sx={{
            padding: 3,
            //border: '2px dashed #bbb',
            borderRadius: 3,
            textAlign: 'center',
            transition: 'all 0.3s ease-in-out',
            '&:hover': { boxShadow: 3, borderColor: '#40189d' }
          }}
        >
          <Typography variant="h6" align="center" sx={{ fontWeight: 600, color: '#333',fontFamily: ['Poppins', 'sans-serif'] 
 }}>
        Questionnaire Upload
        </Typography>
          <Stack spacing={1} alignItems="center">
            <UploadIcon size={50} color="#40189d" />
            {/* <Typography variant="body1" sx={{fontFamily: 'Poppins, sans-serif'}} >Click to Upload</Typography> */}
            <input
              ref={fileInputRefQB}
              type="file"
              accept=".docx"
              onChange={(e) => {handleFileChange(e, 'qb')}}
              style={{ display: 'none' }}
              id="qb-upload"
            />
            <label htmlFor="qb-upload">
              <Button component="span" variant="contained" size="small" sx={{fontFamily: 'Poppins, sans-serif', backgroundColor: '#40189d',
                '&:hover': {
                  backgroundColor: '#311270', // <-- Change this to your desired hover color
                },}}>
                Choose File
              </Button>
            </label>
            {/* Allowed Formats Note */}
            <Typography variant="caption" color="text.secondary" sx={{fontFamily: 'Poppins, sans-serif'}}>
                Allowed formats: <strong>.docx</strong>
              </Typography>
            {/* Question Bank File Download Button */}
            {selectedQBFile && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="textSecondary" sx={{fontFamily: 'Poppins, sans-serif'}}>
                  {selectedQBFile.name}
                </Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    const url = URL.createObjectURL(selectedQBFile);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = selectedQBFile.name; // Set file name for download
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Submit Button */}
      <Grid item xs={12} textAlign="right">
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading}
          sx={{fontFamily: 'Poppins, sans-serif', backgroundColor: '#40189d',
                '&:hover': {
                  backgroundColor: '#311270', // <-- Change this to your desired hover color
                },}}
        >
          {uploading ? <CircularProgress size={24} sx={{ color: 'white', fontFamily: 'Poppins, sans-serif'}} /> : 'Submit'}
        </Button>
      </Grid>

      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={10000}
        onClose={() => {setOpenSuccessSnackbar(false)}}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {setOpenSuccessSnackbar(false)}}
          severity="success"
          variant="standard"
          sx={{ width: '100%' }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={10000}
        onClose={() => {setOpenErrorSnackbar(false)}}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {setOpenErrorSnackbar(false)}}
          severity="error"
          variant="standard"
          sx={{ width: '100%' }}
          iconMapping={{
            error: <ErrorIcon fontSize="inherit" />
          }}
        >
          ❌ {errorMessage}
        </Alert>
      </Snackbar>

      {/* Upload Status Modal */}
      <Dialog open={openModal} onClose={() => {setOpenModal(false)}}>
        <DialogTitle>Response</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );  
}