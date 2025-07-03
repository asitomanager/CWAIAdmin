'use client';

import React from 'react';
import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { CandidatesTable } from './candidates-table';

export function CandidatesTabs(): React.ReactElement {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number): void => {
        setSelectedTab(newValue);
    };

    return (
        <>
            <Tabs
                value={selectedTab}
                onChange={handleChange}
                aria-label="Interview Tabs"
                sx={{
                    backgroundColor: 'transparent',
                    borderRadius: '10px',
                    p: 0.5,
                    display: 'flex',
                    '& .MuiTabs-flexContainer': {
                        marginRight: '0px',
                    },
                    '& .MuiTab-root:not(:first-of-type)': {
                        marginLeft: '4px', // controlled spacing between tabs
                    },
                    '& .MuiTabs-indicator': {
                        display: 'none',
                    },
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        fontSize: '11px',
                        color: '#6b6b6b',
                        borderRadius: '50px',
                        px: 2,
                        py: 0.5,
                        minHeight: '25px',
                        minWidth: 'auto',
                        border: '1px solid #ccc',
                        backgroundColor: 'transparent',
                        transition: '0.3s ease',
                        margin: 0, // Reset any margin
                        '&:hover': {
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                        },
                        '&.Mui-selected': {
                            color: '#fff',
                            backgroundColor: '#521fc9',
                            border: '1px solid #40189d',
                        },
                    },
                }}
            >
                <Tab label="Not Scheduled" id="not-scheduled-tab" aria-controls="not-scheduled-panel" />
                <Tab label="Scheduled" id="scheduled-tab" aria-controls="scheduled-panel" />
                <Tab label="In Progress" id="inprogress-tab" aria-controls="inprogress-panel" />
                <Tab label="Completed" id="completed-tab" aria-controls="completed-panel" />
                <Tab label="ALL" id="all-tab" aria-controls="all-panel" />
            </Tabs>

            {/* Tab Content */}
            <Box role="tabpanel" hidden={selectedTab !== 0} id="not-scheduled-panel" aria-labelledby="not-scheduled-tab">
                {selectedTab === 0 && <CandidatesTable rowsPerPage={10} status="Not Scheduled" selectedTab={0} />}
            </Box>

            <Box role="tabpanel" hidden={selectedTab !== 1} id="scheduled-panel" aria-labelledby="scheduled-tab">
                {selectedTab === 1 && <CandidatesTable rowsPerPage={10} status="Scheduled" selectedTab={1} />}
            </Box>

            <Box role="tabpanel" hidden={selectedTab !== 2} id="inprogress-panel" aria-labelledby="inprogress-tab">
                {selectedTab === 2 && <CandidatesTable rowsPerPage={10} status="In Progress" selectedTab={2} />}
            </Box>

            <Box role="tabpanel" hidden={selectedTab !== 3} id="completed-panel" aria-labelledby="completed-tab">
                {selectedTab === 3 && <CandidatesTable rowsPerPage={10} status="Completed" showTranscript showAnasysReport selectedTab={3} />}
            </Box>

            <Box role="tabpanel" hidden={selectedTab !== 4} id="all-panel" aria-labelledby="all-tab">
                {selectedTab === 4 && <CandidatesTable rowsPerPage={10} status="ALL" selectedTab={4} />}
            </Box>
        </>
    );
}