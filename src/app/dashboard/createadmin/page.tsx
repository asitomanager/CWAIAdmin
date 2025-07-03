import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import CreateAdminUser from '@/components/dashboard/createadmin/createadmin';

export const metadata = { title: `Create Admin User | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Grid>
        <CreateAdminUser />
      </Grid>
    </Stack>
  );
}