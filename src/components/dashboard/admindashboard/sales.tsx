'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  useTheme,
  SxProps,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import type { ApexOptions } from 'apexcharts';
import { useRouter } from 'next/navigation';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SalesProps {
  sx?: SxProps;
}
interface TimelineResponseItem {
  interview_date: string;
  completed_count: number;
}
const DURATION_OPTIONS: ('7 Days' | '30 Days' | '3 Months')[] = ['7 Days', '30 Days', '3 Months'];
const Sales: React.FC<SalesProps> = ({ sx }) => {
  const theme = useTheme();
  const router = useRouter();
  const [data, setData] = useState<TimelineResponseItem[]>([]);
  const [duration, setDuration] = useState<'7 Days' | '30 Days' | '3 Months'>('7 Days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
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
        const res = await fetch(
          `${paths.urls.timelineGraph}?duration=${encodeURIComponent(duration)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (res.status === 401) {
          await authClient.signOut();
          router.push(paths.auth.signIn);
          window.location.reload();
          return;
        }
        const responseData: TimelineResponseItem[] = await res.json() as TimelineResponseItem[];

        if (!Array.isArray(responseData)) throw new Error('Invalid data format received.');
        setData(responseData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load data.');
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [duration, router]);
  const validData = Array.isArray(data)
    ? data.filter(
        (item): item is TimelineResponseItem =>
          item &&
          typeof item.interview_date === 'string' &&
          typeof item.completed_count === 'number'
      )
    : [];
  validData.sort((a, b) =>
    new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime()
  );
  const chartCategories: string[] = validData.map((item) =>
    item.interview_date ?? ''
  );
  const chartData: number[] = validData.map(item =>
    typeof item.completed_count === 'number' ? item.completed_count : 0
  );
  const isChartDataValid = chartCategories.every(Boolean) && chartCategories.length === chartData.length;
  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      type: 'area',
      height: 300,       // explicitly set height
      width: '100%',
      offsetX: 10,
      offsetY: 0,
    },
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    colors: ['#f57c00'],
      xaxis: {
          categories: chartCategories,
          labels: {
              rotate: -60,
              trim: false,
              hideOverlappingLabels: false,
              showDuplicates: false,
              style: { colors: theme.palette.text.secondary },
          },
          axisBorder: { show: true, color: theme.palette.divider },
          axisTicks: { show: true, color: theme.palette.divider },
          tickPlacement: 'on',
          //range: chartCategories.length +0,
      },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary },
        formatter: (val: number) => (val !== undefined ? val.toString() : '0'),
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    tooltip: { enabled: true, shared: true, intersect: false },
    legend: { show: false },
  };
  const handleDurationChange = (event: SelectChangeEvent) => {
    setDuration(event.target.value as '7 Days' | '30 Days' | '3 Months');
  };
  return (
    <Card sx={sx}>
      <CardHeader
        title="New Enrollments"
        action={
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="duration-label">Duration</InputLabel>
                <Select
                    labelId="duration-label"
                    id="duration-select"
                    value={duration}
                    label="Duration"
                    onChange={handleDurationChange}
                >
                    {DURATION_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        }
      />
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : isClient && isChartDataValid ? (
          <Chart
            key={duration}
            options={chartOptions}
            series={[{ name: 'New Enrollments', data: chartData }]}
            type="area"
            height={350}
          />
        ) : (
          <Typography>No valid data available for chart.</Typography>
        )}
      </CardContent>
    </Card>
  );
};
export default Sales;