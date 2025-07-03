'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { paths } from '@/paths';
import { UserContext } from '@/contexts/user-context';
import { Container } from '@mui/system';
import { Box, Paper } from '@mui/material';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = { email: '', password: '' };

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const userData = React.useContext(UserContext);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
  
      try {
        const params = new URLSearchParams({
          username: values.email,
          password: values.password,
        });
  
        const response = await fetch(paths.urls.signin, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });
        // Handle different error scenarios based on response status
        if (!response.ok) {
          const errorData: unknown = await response.json(); // Use `unknown` instead of `any`
          let errorMessage = 'An unexpected error occurred. Please try again.';
        
          if (typeof errorData === 'object' && errorData !== null && 'detail' in errorData) {
            const errorDetail = (errorData as { detail?: string }).detail; // Type assertion
            if (typeof errorDetail === 'string') {
              errorMessage = errorDetail;
            }
          }
        
          switch (response.status) {
            case 400:
              errorMessage = errorMessage || 'Bad request. Please check your input.';
              break;
            case 401:
              errorMessage = 'Invalid credentials. Please check your email and password.';
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission to access this resource.';
              break;
            case 404:
              errorMessage = 'User not found. Please check your email.';
              break;
            case 429:
              errorMessage = 'Too many login attempts. Please wait and try again later.';
              break;
            case 500:
              errorMessage = 'Internal server error. Please try again later.';
              break;
          }
        
          throw new Error(errorMessage);
        }        
  
        // ✅ Define a strict response type
        interface LoginResponse {
          access_token: string;
          refresh_token: string;
          user_id: string;
          name: string;
          user_location: string;
          role : string;
        }
  
        const data = (await response.json()) as LoginResponse; // ✅ Explicitly cast to LoginResponse
  
        // ✅ Check the 'role' condition
        if (data?.role === 'Candidate') {
          throw new Error('Unauthorized user.');
       }

        userData?.updateUser({ userdata: data });
  
        const {
          access_token: accessToken,
          refresh_token: refreshToken,
          user_id: userId,
          name,
          user_location: userLocation,
        } = data;
  
        localStorage.setItem('app_user_id', userId);
        localStorage.setItem('app_access_token', accessToken);
        localStorage.setItem('app_refresh_token', refreshToken);
        localStorage.setItem('app_user_name', name);
        localStorage.setItem('app_user_location', userLocation);
  
        router.push(paths.dashboard.admindashboard);
      } catch (error) {
        if (error instanceof Error) {
          setError('root', { type: 'server', message: error.message });
        }
      } finally {
        setIsPending(false);
      }
    },
    [router, setError, userData]
  );    

  return (
    <><>
      <Box
        component="img"
        src="/assets/career_wings_logo-removebg-preview.png"
        alt="Background Design"
        sx={{
          display: 'none',
          '@media (max-width: 440px)': {
            display: 'block',
            maxWidth: 200,
            margin: '0 auto 30%', // for debugging
          },
        }} /></><>
        <Container component="main" maxWidth="xs" sx={{ display: "flex", height: "100%", alignItems: "center" }}>
          <Paper elevation={6} sx={{ padding: 3, borderRadius: 4, width: "100%" }}>
            <Stack spacing={2}>
              <Typography variant="h5" align="center" gutterBottom fontWeight={700}>
                <span style={{ color: '#5A189A' }}>Sign In</span>
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.email)}>
                        <InputLabel>Email Address</InputLabel>
                        <OutlinedInput {...field} label="Email Address" type="email" />
                        {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                      </FormControl>
                    )} />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.password)}>
                        <InputLabel>Password</InputLabel>
                        <OutlinedInput
                          {...field}
                          endAdornment={showPassword ? (
                            <EyeIcon
                              cursor="pointer"
                              fontSize="var(--icon-fontSize-md)"
                              onClick={() => {
                                setShowPassword(false);
                              } } />
                          ) : (
                            <EyeSlashIcon
                              cursor="pointer"
                              fontSize="var(--icon-fontSize-md)"
                              onClick={() => {
                                setShowPassword(true);
                              } } />
                          )}
                          label="Password"
                          type={showPassword ? 'text' : 'password'} />
                        {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                      </FormControl>
                    )} />
                  {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
                  <Button fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      background: "linear-gradient(45deg, #6200ea, #9c27b0)",
                      color: "white",
                      '&:hover': { background: "linear-gradient(45deg, #9c27b0, #6200ea)" }
                    }}
                    disabled={isPending} type="submit">
                    Sign In
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Container></></>
  );
}