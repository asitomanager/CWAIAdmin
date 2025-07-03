'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { paths } from '@/paths';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { authClient } from '@/lib/auth/client';
import { useRouter } from "next/navigation";
import { Box } from '@mui/material';

export interface TasksProgressProps {
  sx?: SxProps;
}

interface DashboardData {
  completed_interviews?: number;
  message?: string;
}

export function TasksProgress({ sx }: TasksProgressProps): React.JSX.Element {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect((): void => {
    const fetchData = async (): Promise<void> => {
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

        const response = await fetch(paths.urls.dashboard, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          await authClient.signOut();
          router.push(paths.auth.signIn);
          window.location.reload();
          return;
        }        

        if (!response.ok) {
          const errorData = (await response.json()) as DashboardData; // ✅ Type assertion
          throw new Error(errorData.message || 'Failed to fetch task progress data');
        }

        const data: DashboardData = (await response.json()) as DashboardData; // ✅ Type assertion
        setProgress(data.completed_interviews ?? 0);
      } catch (err) {
        if (err instanceof Error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching task progress data:', err.message);
          }
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <Card sx={{ ...sx, backgroundColor: '#8bc741', color: 'white', height: '130px' }}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Avatar
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                height: '56px',
                width: '52px',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 42 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M40.614 9.36994C40.443 8.22658 39.8679 7.18234 38.9932 6.4265C38.1184 5.67067 37.0018 5.25328 35.8457 5.25H6.1543C4.99822 5.25328 3.88159 5.67067 3.00681 6.4265C2.13203 7.18234 1.55701 8.22658 1.38599 9.36994L21 22.0618L40.614 9.36994Z"
                  fill="white"
                />
                <path
                  d="M21.7127 24.7274C21.5003 24.8647 21.2529 24.9378 21 24.9378C20.7471 24.9378 20.4997 24.8647 20.2873 24.7274L1.3125 12.4503V31.9081C1.31389 33.1918 1.82445 34.4225 2.73217 35.3302C3.63988 36.238 4.87061 36.7485 6.15431 36.7499H35.8457C37.1294 36.7485 38.3601 36.238 39.2678 35.3302C40.1755 34.4225 40.6861 33.1918 40.6875 31.9081V12.449L21.7127 24.7274Z"
                  fill="white"
                />
              </svg>
            </Avatar>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle fontSize="20px" />
                <Typography color="inherit" variant="overline" sx={{ fontFamily: "'poppins', sans-serif",fontWeight: 500}}>
                  Completed
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexGrow: 1 }}>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Typography variant="h4">{progress}</Typography>
              )}</Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}