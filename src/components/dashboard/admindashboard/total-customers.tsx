'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { paths } from '@/paths';
import { SpinnerGap } from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import { authClient } from '@/lib/auth/client';
import { useRouter } from "next/navigation";
import { Box } from '@mui/material';

export interface TotalCustomersProps {
  sx?: SxProps;
}

interface DashboardData {
  inprogress_interviews?: number;
  message?: string;
}

export function TotalCustomers({ sx }: TotalCustomersProps): React.JSX.Element {
  const [totalCustomers, setTotalCustomers] = React.useState<number | null>(null);
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
          throw new Error(errorData.message || 'Failed to fetch total customers');
        }

        const data: DashboardData = (await response.json()) as DashboardData; // ✅ Type assertion
        setTotalCustomers(data.inprogress_interviews ?? 0);
      } catch (err) {
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
  }, []);

  return (
    <Card sx={{ ...sx, backgroundColor: '#1dd083', color: 'white', height: '130px' }}>
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
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1811 22.0083C15.065 21.9063 14.7968 21.6695 14.7015 21.5799C12.3755 19.3941 10.8517 15.9712 10.8517 12.1138C10.8517 5.37813 15.4868 0.0410156 21.001 0.0410156C26.5152 0.0410156 31.1503 5.37813 31.1503 12.1138C31.1503 15.9679 29.6292 19.3884 27.3094 21.5778C27.2118 21.6699 26.9384 21.9116 26.8238 22.0125L26.8139 22.1799C26.8789 23.1847 27.554 24.0553 28.5232 24.3626C35.7277 26.641 40.9507 32.0853 41.8276 38.538C41.9483 39.3988 41.6902 40.2696 41.1198 40.9254C40.5495 41.5813 39.723 41.9579 38.8541 41.9579C32.4956 41.9591 9.50672 41.9591 3.14818 41.9591C2.2787 41.9591 1.4518 41.5824 0.881242 40.9263C0.31068 40.2701 0.0523763 39.3989 0.172318 38.5437C1.05145 32.0851 6.27444 26.641 13.4777 24.3628C14.4504 24.0544 15.1263 23.1802 15.1885 22.1722L15.1811 22.0083Z"
                  fill="white"
                />
              </svg>
            </Avatar>

            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SpinnerGap fontSize="20px" />
                <Typography color="inherit" variant="overline" sx={{ fontFamily: "'poppins', sans-serif",fontWeight: 500,whiteSpace: 'nowrap'}}>
                  In Progress
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexGrow: 1 }}>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Typography variant="h4">{totalCustomers ?? 'N/A'}</Typography>
              )}</Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
);
}