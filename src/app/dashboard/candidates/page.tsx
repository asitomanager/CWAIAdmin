import * as React from 'react';
import { config } from '@/config';
import type { Metadata } from 'next';
import { CandidatesTabs } from '@/components/dashboard/candidate/candidate-tabs';

export const metadata = { title: `Careerwings.AI | Candidate Details | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
        <CandidatesTabs />
  );
}