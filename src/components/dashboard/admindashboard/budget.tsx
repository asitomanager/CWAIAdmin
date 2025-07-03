'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { paths } from '@/paths';
import { CalendarCheck } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { authClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material';

export interface BudgetProps {
  sx?: SxProps;
}

export function Budget({ sx }: BudgetProps): React.JSX.Element {
  const [scheduledInterviews, setScheduledInterviews] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        let token = localStorage.getItem('app_access_token');
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
          const errorData = (await response.json()) as { message?: string };
          throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }

        const data = (await response.json()) as { scheduled_interviews?: number };
        setScheduledInterviews(data.scheduled_interviews ?? 0);

      } catch (err: unknown) {
        if (err instanceof Error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching data:', err.message);
          }
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [router]);

  return (
    <Card sx={{ ...sx, backgroundColor: '#49a9f8', color: 'white', height: '130px' }}>
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
                <path d="M38.4998 10.4995H35.0002V38.4999H38.4998C40.4245 38.4999 42 36.9238 42 34.9992V13.9992C42 12.075 40.4245 10.4995 38.4998 10.4995Z" fill="white" />
                <path d="M27.9998 10.4995V6.9998C27.9998 5.07515 26.4243 3.49963 24.5001 3.49963H17.4998C15.5756 3.49963 14.0001 5.07515 14.0001 6.9998V10.4995H10.5V38.4998H31.5V10.4995H27.9998ZM24.5001 10.4995H17.4998V6.99929H24.5001V10.4995Z" fill="white" />
                <path d="M3.50017 10.4995C1.57551 10.4995 0 12.075 0 13.9997V34.9997C0 36.9243 1.57551 38.5004 3.50017 38.5004H6.99983V10.4995H3.50017Z" fill="white" />
              </svg>
            </Avatar>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                 <CalendarCheck fontSize="20px" />
                <Typography
                  color="inherit"
                  variant="overline"
                  sx={{ fontFamily: "'poppins', sans-serif",fontWeight: 500}} // ✅ wrap in { } correctly
                >
                  Scheduled
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexGrow: 1 }}>
                {loading ? (
                  <Typography>Loading...</Typography>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  <Typography variant="h4">{scheduledInterviews ?? 'N/A'}</Typography>
                )}
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}