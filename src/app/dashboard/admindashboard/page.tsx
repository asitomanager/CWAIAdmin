import * as React from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { Budget } from '@/components/dashboard/admindashboard/budget';
import { TasksProgress } from '@/components/dashboard/admindashboard/tasks-progress';
import { TotalCustomers } from '@/components/dashboard/admindashboard/total-customers';
import { TotalProfit } from '@/components/dashboard/admindashboard/total-profit';
import { Traffic } from '@/components/dashboard/admindashboard/traffic';
import { Stack } from '@mui/system';
import Sales from '@/components/dashboard/admindashboard/sales';

export const metadata = { title: `Careerwings.AI | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
      <Stack spacing={1}>
        <Grid container spacing={1.5}>
          <Grid lg={3} md={6} sm={6} xs={12}>
            <Budget sx={{ height: '100%' }} />
          </Grid>
          <Grid lg={3} md={6} sm={6} xs={12}>
            <TotalCustomers sx={{ height: '100%' }} />
          </Grid>
          <Grid lg={3} md={6} sm={6} xs={12}>
            <TasksProgress sx={{ height: '100%' }} />
          </Grid>
          <Grid lg={3} md={6} sm={6} xs={12}>
            <TotalProfit sx={{ height: '100%' }} />
          </Grid>
          <Grid lg={7} xs={12}>
            <Sales sx={{ height: '100%' }} />
          </Grid>
          <Grid lg={5} md={6} xs={12}>
            <Traffic sx={{ height: '100%' }} />
          </Grid>
        </Grid>
      </Stack>
  );  
}