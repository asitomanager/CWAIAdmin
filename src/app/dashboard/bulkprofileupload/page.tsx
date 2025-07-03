import * as React from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { BulkProfileUpload } from '@/components/dashboard/bulkprofileupload/BulkProfileUpload';
import { config } from '@/config';
import type { Metadata } from 'next';

export const metadata = { title: `Careerwings.AI | Profile Upload | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3} >
      <Grid container justifyContent="center">
        <BulkProfileUpload />
      </Grid>
    </Stack>
  );
}