'use client';

import React, { useState } from 'react';
import {
  Button,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  InputAdornment,
  IconButton,
  FormControl,
  Grid
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function CreateAdminUser(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [passwordError, setPasswordError] = useState(false);

  // New State for Field Validation
  const [emailError, setEmailError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordEmptyError, setPasswordEmptyError] = useState(false);
  const [rePasswordEmptyError, setRePasswordEmptyError] = useState(false);

  const adminList = [
    { id: 1, email: 'sai@ykinnosoft.com', username: 'Sai' },
    { id: 2, email: 'sanath@gmail.com', username: 'Sanath' }
  ];

  // Validate Passwords
  const handleRePasswordChange = (value: string): void => {
    setRePassword(value);
    setPasswordError(password !== value);
  };

  // Form Submit Validation
  const handleSave = (): void => {
    setEmailError(email.trim() === '');
    setUsernameError(username.trim() === '');
    setPasswordEmptyError(password.trim() === '');
    setRePasswordEmptyError(rePassword.trim() === '');

    if (!email || !username || !password || !rePassword || passwordError) return;

    // eslint-disable-next-line no-alert -- Alert is used to provide user feedback upon successful save.
    alert('User saved successfully!');
  };

  return (
    <Stack spacing={3}>
      {/* First Row - Mail ID & Username */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Mail ID" 
            value={email} 
            onChange={(e) => { setEmail(e.target.value); }} 
            fullWidth 
            error={emailError}
            helperText={emailError ? 'Mail ID is required' : ''}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label="User Name" 
            value={username} 
            onChange={(e) => { setUsername(e.target.value); }} 
            fullWidth 
            error={usernameError}
            helperText={usernameError ? 'User Name is required' : ''}
          />
        </Grid>
      </Grid>

      {/* Second Row - Password & Re-Password */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={(e) => { setPassword(e.target.value); }} 
            fullWidth 
            error={passwordEmptyError}
            helperText={passwordEmptyError ? 'Password is required' : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => { setShowPassword(!showPassword); }}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={passwordError || rePasswordEmptyError}>
            <TextField 
              label="Confirm Password" 
              type={showRePassword ? 'text' : 'password'} 
              value={rePassword} 
              onChange={(e) => { handleRePasswordChange(e.target.value); }} 
              fullWidth 
              error={passwordError || rePasswordEmptyError}
              helperText={
                rePasswordEmptyError
                  ? 'Confirm Password is required'
                  : passwordError
                  ? 'Passwords do not match'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => { setShowRePassword(!showRePassword); }}>
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
            onClick={handleSave}
            disabled={!email || !username || !password || !rePassword || passwordError}
          >
            Save
          </Button>
          <Button variant="outlined" onClick={() => {
            setEmail('');
            setUsername('');
            setPassword('');
            setRePassword('');
            setPasswordError(false);
            setEmailError(false);
            setUsernameError(false);
            setPasswordEmptyError(false);
            setRePasswordEmptyError(false);
          }}>
            Reset
          </Button>
          <Button variant="contained" color="error" disabled={selectedUsers.length === 0}>
            Delete
          </Button>
        </Stack>
      </Grid>

      {/* Admin Data Table */}
      <Paper variant="outlined" sx={{ border: '1px solid #ccc' }}>
        <TableContainer>
          <Table sx={{ border: '1px solid #ddd' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Select</TableCell>
                <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>S.No</TableCell>
                <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>User Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminList.map(({ id, email: adminEmail, username: adminUsername }, index) => (
                <TableRow key={id}>
                  <TableCell sx={{ border: '1px solid #ddd' }}>
                    <Checkbox
                      checked={selectedUsers.includes(id)}
                      onChange={() => {
                        setSelectedUsers(selectedUsers.includes(id)
                          ? selectedUsers.filter(i => i !== id)
                          : [...selectedUsers, id]);
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{index + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{adminEmail}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{adminUsername}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}