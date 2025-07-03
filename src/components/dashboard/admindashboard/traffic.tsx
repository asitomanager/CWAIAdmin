'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { SxProps } from '@mui/material/styles';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import { Box } from '@mui/material';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useRouter } from "next/navigation";

// ✅ Type Definition for API Response
interface DashboardData {
  scheduled_interviews?: number;
  inprogress_interviews?: number;
  completed_interviews?: number;
  message?: string;
}

export function Traffic({ sx }: { sx?: SxProps }): React.JSX.Element {
  const [chartData, setChartData] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const labels = ['Scheduled', 'In Progress', 'Completed'];
  const chartOptions = useChartOptions(labels);

  const fetchDashboardData = React.useCallback(async (): Promise<void> => {
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
        const errorData: DashboardData = (await response.json()) as DashboardData; // ✅ Explicitly typed
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }
    
      const data: DashboardData = (await response.json()) as DashboardData; // ✅ Explicitly set `unknown`
      
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response format');
      }
    
      const dashboardData = data; // ✅ Safe type assertion
    
      setChartData([
        dashboardData.scheduled_interviews ?? 0,
        dashboardData.inprogress_interviews ?? 0,
        dashboardData.completed_interviews ?? 0,
      ]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching data:', err.message); // ✅ Allowed only in development
        }
        setError(err.message);
      }
    }
     finally {
      setLoading(false);
    }
  }, []);  

  React.useEffect((): void => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Card sx={sx}>
      <CardHeader title="Interview Status" sx={{ fontFamily: 'Poppins, sans-serif',fontWeight: 900}}/>
      <CardContent>
        <Stack spacing={2}>
          {/* ✅ Chart Component */}
          <Chart height={300} options={chartOptions} series={chartData} type="donut" width="100%" />

          {/* ✅ Labels with Color Indicators */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center',fontFamily: 'Poppins, sans-serif',fontWeight: 900 }}>
            {chartData.map((item, index) => (
              <Stack key={labels[index]} spacing={1} sx={{ alignItems: 'center', flexDirection: 'row' }}>
              <Stack spacing={0.5} sx={{ alignItems: 'center',fontFamily: 'Poppins, sans-serif',fontWeight: 900 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif',fontWeight: 600}}>{labels[index]}</Typography>
                <Typography color="text.secondary" variant="subtitle2">
                  {/* Color Indicator Box */}
                    <Box
                      sx={{
                        width: 1,
                        height: 12,
                        bgcolor: (chartOptions.colors?.[index] as string) || 'gray',
                        borderRadius: '10%',
                        fontFamily: 'Poppins, sans-serif',fontWeight: 900
                      }}
                    />
                    {item as unknown as string}
                </Typography>
              </Stack>
            </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ✅ Updated Chart Options with Safe Colors
function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [
      theme.palette.primary.main ?? '#007bff', // Default Blue
      theme.palette.success.main ?? '#28a745', // Default Green
      theme.palette.warning.main ?? '#ffc107', // Default Yellow
    ],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        colors: ['#fff'],
      },
      formatter: (value: number, { seriesIndex, w }: { seriesIndex: number; w: { config: { series: number[] } } }) => {
        const total = w.config.series.reduce((acc, val) => acc + val, 0);
        const count = w.config.series[seriesIndex];
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
        return `${percentage}%`;
      },
    },
    labels,
    legend: { show: false },
  };
}