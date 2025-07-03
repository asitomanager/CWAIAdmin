'use client';

import React, { useState } from 'react';
import {
  Button,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { paths } from '@/paths';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {Alert} from '@mui/material';
import { authClient } from '@/lib/auth/client';
import router from 'next/router';

export default function ChangePassword(): React.JSX.Element {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  
  // ✅ State for error messages
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');

  // ✅ Function to validate password strength
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one digit.";
    if (!/[!@#$%^&*()_+=\-[\]{}|;:'",.<>?/\\~`]/.test(password)) 
      return "Password must contain at least one special character.";

    return null; // ✅ Password is valid
  };

  // ✅ Handle new password change & validate
  const handleNewPasswordChange = (value: string): void => {
    setNewPassword(value);
    setPasswordError(validatePassword(value));
  };

  // ✅ Handle API Call to Change Password
  const handleSave = async (): Promise<void> => {
    if (!oldPassword || !newPassword) {
      setErrorMessage("Please enter both the old and new passwords.");
      setOpenErrorSnackbar(true);
      return;
    }
  
    const passwordValidationMessage = validatePassword(newPassword);
    if (passwordValidationMessage) {
      setErrorMessage(passwordValidationMessage);
      setOpenErrorSnackbar(true);
      return;
    }
  
    try {
      const token = localStorage.getItem("app_access_token");
      if (!token) {
        await authClient.signOut();
        await router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
  
      const response = await fetch(paths.urls.changePassword, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
        }),
      });
      
      if (response.status === 401) {
        await authClient.signOut();
        await router.push(paths.auth.signIn);
        window.location.reload();
        return;
      }
      interface ChangePasswordResponse {
        detail?: string;
        message?: string;
      }
      
      const responseData = await response.json() as ChangePasswordResponse;      
  

      if (!response.ok) {
        // If response has `detail`, show it
        const backendMessage = (responseData as { detail?: string }).detail || "Failed to change password.";
        throw new Error(backendMessage);
      }
  
      // ✅ If success, use backend message if available
      const successMessage = (responseData as { message?: string }).message || "Password changed successfully!";
      setSnackbarMessage(successMessage);
      setOpenSuccessSnackbar(true);
  
      setOldPassword("");
      setNewPassword("");
      setPasswordError(null);
  
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error changing password.");
      setOpenErrorSnackbar(true);
    }
  };  
  // ✅ Handle Close Dialog & Reset Fields
  const handleCloseModal = (): void => {
    setOpenModal(false);
    setModalMessage('');
  };

  return (
    <Stack spacing={3} sx={{backgroundColor: "#fff",p: 2, borderRadius: 2,}}>
      <Grid container spacing={2}>
        {/* Old Password */}
        <Grid item xs={12} md={6} sx={{fontFamily: 'Poppins, sans-serif'}}>
          <TextField 
            label="Old Password" 
            type={showPassword ? 'text' : 'password'} 
            value={oldPassword} 
            sx={{fontFamily: 'Poppins, sans-serif'}}
            onChange={(e) => {setOldPassword(e.target.value)}}
            fullWidth 
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => {setShowPassword(!showPassword)}}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* New Password */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={Boolean(passwordError)}>
            <TextField 
              label="New Password" 
              type={showRePassword ? 'text' : 'password'} 
              value={newPassword} 
              sx ={{fontFamily: 'Poppins, sans-serif'}}
              onChange={(e) => {handleNewPasswordChange(e.target.value)}} 
              fullWidth 
              helperText={passwordError || ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => {setShowRePassword(!showRePassword)}}>
                      {showRePassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        </Grid>
      </Grid>

      {/* Buttons */}
      <Grid container justifyContent="flex-end">
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{fontFamily: 'Poppins, sans-serif'}}
            onClick={handleSave}
            disabled={!oldPassword || !newPassword || Boolean(passwordError)}
          >
            Save
          </Button>
          <Button variant="outlined" sx={{fontFamily: 'Poppins, sans-serif'}} onClick={() => {
            setOldPassword('');
            setNewPassword('');
            setPasswordError(null);
          }}>
            Reset
          </Button>
        </Stack>
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
          iconMapping={{ success: <CheckCircleIcon fontSize="inherit" /> }}
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
          iconMapping={{ error: <ErrorIcon fontSize="inherit" /> }}
        >
          ❌ {errorMessage}
        </Alert>
      </Snackbar>


      {/* ✅ Dialog for Success/Error Messages */}
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