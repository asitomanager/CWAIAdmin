'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useRouter } from "next/navigation";
import { Box } from '@mui/material';
import { FileText } from '@phosphor-icons/react';

export interface TotalProfitProps {
  sx?: SxProps;
}

interface DashboardData {
  total_applicants?: string;
  message?: string;
}

export function TotalProfit({ sx }: TotalProfitProps): React.JSX.Element {
  const [totalProfit, setTotalProfit] = React.useState<string | null>(null);
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
          throw new Error(errorData.message || 'Failed to fetch total profit data');
        }

        const data: DashboardData = (await response.json()) as DashboardData; // ✅ Type assertion
        setTotalProfit(data.total_applicants ?? 'N/A');
      } catch (err) {
        if (err instanceof Error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching total profit:', err.message);
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
    <Card sx={{ ...sx, backgroundColor: '#40189d', color: 'white', height: '130px'}}>
      <CardContent sx={{ overflow: 'hidden' }}>
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
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30.25 5.75H28.5V2.25C28.5 1.78587 28.3156 1.34075 27.9874 1.01256C27.6593 0.684374 27.2141 0.5 26.75 0.5C26.2859 0.5 25.8407 0.684374 25.5126 1.01256C25.1844 1.34075 25 1.78587 25 2.25V5.75H11V2.25C11 1.78587 10.8156 1.34075 10.4874 1.01256C10.1592 0.684374 9.71413 0.5 9.25 0.5C8.78587 0.5 8.34075 0.684374 8.01256 1.01256C7.68437 1.34075 7.5 1.78587 7.5 2.25V5.75H5.75C4.35761 5.75 3.02226 6.30312 2.03769 7.28769C1.05312 8.27226 0.5 9.60761 0.5 11V12.75H35.5V11C35.5 9.60761 34.9469 8.27226 33.9623 7.28769C32.9777 6.30312 31.6424 5.75 30.25 5.75Z"
                  fill="white"
                />
                <path
                  d="M0.5 30.25C0.5 31.6424 1.05312 32.9777 2.03769 33.9623C3.02226 34.9469 4.35761 35.5 5.75 35.5H30.25C31.6424 35.5 32.9777 34.9469 33.9623 33.9623C34.9469 32.9777 35.5 31.6424 35.5 30.25V16.25H0.5V30.25Z"
                  fill="white"
                />
              </svg>
            </Avatar>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FileText fontSize="20px" />
                <Typography
                  color="inherit"
                  variant="overline"
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    //fontSize: '0.675rem'  // Smaller to fit the layout
                  }}
                >
                  Applicants
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', flexGrow: 1 }}>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Typography variant="h4">{totalProfit}</Typography>
              )}</Box>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}