import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { JdUpload } from '@/components/dashboard/jdupload/JdUpload';

export const metadata = { title: `Careerwings.AI | JD & Question Bank | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Grid>
        <JdUpload />
      </Grid>
    </Stack>
  );
}
