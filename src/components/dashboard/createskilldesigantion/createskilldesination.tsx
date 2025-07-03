'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Button, Stack, Paper, Select, MenuItem, FormControl, InputLabel, TextField, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import { paths } from '@/paths';
import { useRouter } from "next/navigation";
import { authClient } from '@/lib/auth/client';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function CreateSkillDesignation(): React.JSX.Element {
  const [lovName, setLovName] = useState('');
  const [lovValue, setLovValue] = useState('');
  const [lovList, setLovList] = useState<{ id: number; value: string}[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');

  // ✅ Added state for dialog messages
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const router = useRouter();

  interface ErrorResponse {
    detail?: string;
  }
  // Fetch LOV values based on selected LOV Name
  const fetchLOVValues = async(lovType: string): Promise<void> => {
    if (!lovType) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('app_access_token');
      if (!token) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      const response = await fetch(`${paths.urls.lov}?lov_name=${lovName}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch data');

      const data = (await response.json()) as string[];

      setLovList(
        Array.isArray(data)
          ? data.map((item, index) => ({
              id: index + 1,
              value: item,
            }))
          : []
      );
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(lovName){
      void fetchLOVValues(lovName);
    }
  }, [lovName]);

  // ✅ Added function to close the dialog
  const handleCloseModal = (): void => {
    setOpenModal(false);
    setModalMessage('');
    setLovName('');   // ✅ Reset LOV name
    setLovValue('');  // ✅ Reset LOV value
    setSelectedItems([]);  // ✅ Clear selected items
    console.log(selectedItems);
  };

  // Handle Save
  const handleSave = async (): Promise<void> => {
    if (!lovName || !lovValue) {
      setErrorMessage("LOV Name and Value are required.");
      setOpenErrorSnackbar(true);
      return;
    }
  
    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
  
      const formData = new FormData();
      formData.append("lov_name", lovName);
      formData.append("lov_value", lovValue);
      console.log("form data", formData);
      const response = await fetch(paths.urls.lov, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,  // FormData sets the correct Content-Type automatically
      });

      if (response.status === 401) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
  
      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.detail || "Failed to save.");
      }
  
      setSnackbarMessage(`"${lovName}" - "${lovValue}" added successfully!`);
      //setLovList([...lovList, { id: lovList.length + 1, value: lovValue }]);
      setLovValue("");
      setOpenSuccessSnackbar(true); // Trigger success snackbar
      await fetchLOVValues(lovName);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving.");
      setOpenErrorSnackbar(true); // Trigger error snackbar
    }
  };  

  // Handle Delete
  const handleDelete = async (lovNames: string, value: string): Promise<void> => {
    
    try {
      const token = localStorage.getItem('app_access_token');
      if (!token) {
        await authClient.signOut();
        router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
  
      const formData = new FormData();
      formData.append("lov_name", lovNames);
      formData.append("lov_value", value); // Send all selected values
  
      const response = await fetch(paths.urls.lov, {
        method: "DELETE",
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
        const errorData = (await response.json()) as ErrorResponse;
        throw new Error(errorData.detail || "Failed to delete.");
      }
  
      //setLovList(lovList.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setSnackbarMessage(`"${value}" deleted successfully.`);
      setOpenSuccessSnackbar(true); // Trigger success snackbar
      //window.location.reload();
      await fetchLOVValues(lovName);
    } catch (err) {
      setErrorMessage("Error deleting items.");
      setOpenErrorSnackbar(true); // Trigger error snackbar
    }
  };  

  const lovNameDisplayMap: Record<string, string> = {
    skill: 'Skill',
    designation: 'Designation',
  };

  return (
    
    <Stack spacing={2} sx={{backgroundColor: "#fff",borderRadius: 2,p: 2,}}>
      <FormControl fullWidth>
        <InputLabel sx={{fontFamily: 'Poppins, sans-serif'}}>Select Type</InputLabel>
        <Select value={lovName} label="Select Type" onChange={(e) => { setLovName(e.target.value); }}>
          <MenuItem value="skill" sx={{fontFamily: 'Poppins, sans-serif'}}>Skill</MenuItem>
          <MenuItem value="designation" sx={{fontFamily: 'Poppins, sans-serif'}}>Designation</MenuItem>
        </Select>
      </FormControl>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Enter Value"
          value={lovValue}
          onChange={(e) => {
            const value = e.target.value;
            const sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9\s]/g, ""); // Allows uppercase letters, numbers, and spaces
            setLovValue(sanitizedValue);
          }}
          fullWidth
        />
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
       
        <Button variant="outlined" sx={{fontFamily: 'Poppins, sans-serif',backgroundColor: '#521fc9',color: '#fff','&:hover': {backgroundColor: '#521fc9'}}} onClick={() => { setLovName(''); }}>
          Reset
        </Button>
         <Button variant="contained" color="primary" sx={{fontFamily: 'Poppins, sans-serif',backgroundColor: '#521fc9',color: '#fff','&:hover': {backgroundColor: '#521fc9'}}} onClick={handleSave} disabled={!lovName || !lovValue }>
          Save
        </Button>
        {/* <Button variant="contained" color="error" sx={{fontFamily: 'Poppins, sans-serif'}} onClick={handleDelete} disabled={!selectedItems.length}>
          Delete
        </Button> */}
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {lovName && (
        <Paper
          variant="outlined"
          sx={{ width: '100%', overflow: 'hidden' }}
        >
          <TableContainer>
            <Table
              size="small"
              sx={{
                borderCollapse: 'separate',
                '& td, & th': {
                  fontSize: '13px',
                  padding: '8px 15px',
                  fontFamily: 'Poppins, sans-serif',
                },
              }}
            >
              <TableHead>
                <TableRow sx={{  height: '45px' }}>
                  <TableCell sx={{ width: '10%', fontWeight: 600, textAlign: 'center', color: '#888' }}>
                    S.No
                  </TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 600, color: '#888' }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ width: '10%', fontWeight: 600, color: '#888' }}>
                    Value
                  </TableCell>
                  <TableCell sx={{ width: '20%', fontWeight: 600, textAlign: 'center', color: '#888' }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : lovList.length > 0 ? (
                  lovList.map(({ id, value }, index) => (
                    <TableRow key={id}>
                      <TableCell sx={{ textAlign: 'center' }}>{index + 1}</TableCell>
                      <TableCell>{lovNameDisplayMap[lovName] || 'Type'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {value || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          size="small"
                          sx={{
                            backgroundColor: '#ffe5e5',
                            color: '#d32f2f',
                            fontSize: '11px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            padding: '4px 10px',
                            textTransform: 'none',
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: '#ffcccc',
                            },
                          }}
                          onClick={() => handleDelete(lovName, value)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No Data Available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
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
          {/* ❌*/} {errorMessage} 
        </Alert>
      </Snackbar>

      {/* ✅ Dialog for displaying success/error messages */}
      <Dialog open={openModal} onClose={handleCloseModal}>
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
    </Stack>
  );
}