import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        flexDirection: 'column',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
        overflowY: "auto", 
        background: "linear-gradient(to bottom,rgb(255, 254, 254),rgb(231, 229, 229))"
      }}
    >
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
            <DynamicLogo colorDark="light" colorLight="dark" height={32} width={122} />
          </Box>
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>
      {/* Right Section - Background Image & Logo */}
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
          height: '100vh',
        }}
      >
        {/* Background Image */}
        <Box
          component="img"
          src="/assets/cw_bg_logo.webp"
          alt="Background Design"
          loading="eager"
          decoding="async"
          sx={{
            position: 'absolute',
            width: {
              xs: '100%',
              sm: '120%',
              md: '140%',
            },
            left: "120px",
            height: '100%',
            objectFit: 'cover',
            opacity: 0.9,
            transform: 'skew(-5deg)',
            zIndex: 0,
            top: 0,
          }}
        />

        {/* Content Layer */}
        <Box
          sx={{
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            width: '100%',
            px: 2,
          }}
        >
          {/* Overlay Logo */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 1,
            }}
          >
            {/* Logos container */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Top logo (symbol) */}
              <Box
                component="p"
                sx={{
                  color: "rgb(179,31,40)",
                  fontFamily: "sans-serif",
                  fontSize: {
                    xs: "2rem",
                    sm: "3rem",
                    md: "3rem",
                  },
                  display: "flex",
                  gap: "5px",                  
                  fontWeight: 700,
                  marginTop: "5px",
                  marginBottom: 0,
                }}
              >
                <Box component="span">&lt;</Box>
                <Box component="span">/</Box>
                <Box component="span">&gt;</Box>
              </Box>

              {/* Bottom logo (text/logo) */}
              <Box
                component="img"
                src="/assets/cwai_white_logo.png"
                alt="CWAI Logo"
                sx={{
                  width: {
                    xs: '60%',
                    sm: '50%',
                  },
                  maxWidth: '480px',
                  height: 'auto',
                  mb: 2,
                }}
              />
            </Box>

            {/* Tagline text */}
            <Typography
              variant="h6"
              color="white"
              sx={{
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.9rem',
                },
                mt: -1,
                textAlign: 'center',
              }}
            >
              Accelerate hiring with us
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}