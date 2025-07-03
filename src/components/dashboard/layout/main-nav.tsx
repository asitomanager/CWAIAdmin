'use client';

import * as React from 'react';
import Box from '@mui/material/Box';

import Stack from '@mui/material/Stack';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr'; //  imported UserCircle
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Tooltip } from '@mui/material';
import { IconButton } from '@mui/material'; //Update user icon in admin dashboard//
import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { usePathname } from 'next/navigation';
import { navItems } from './config';
import { paths } from '@/paths';

interface MainNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function MainNav({ isSidebarOpen, setIsSidebarOpen }: MainNavProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLButtonElement>();
  const pathname = usePathname();
  
  const fallbackTitles: Record<string, string> = {
    [paths.dashboard.changepassword]: 'Change Password',
  };

  const currentPage = React.useMemo(() => {
    const item = navItems.find((nav) => pathname?.startsWith(nav.href));
    return item?.title || fallbackTitles[pathname] || '';
  }, [pathname]);


  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '0px solid var(--mui-palette-divider)',
          backgroundColor: '#f2f2f2',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
          width: "100%",
          overflow: "hidden",
          minHeight: "64px",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          {/* LEFT SIDE (Toggle + Title) */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title={isSidebarOpen ? 'Collapse' : 'Expand'}>
              <IconButton
                onClick={() => { setIsSidebarOpen(!isSidebarOpen) }}
                sx={{ display: { xs: 'none', lg: 'inline-flex' } }}
              >
                {isSidebarOpen ? <MenuIcon /> : <ArrowForwardIcon />}
              </IconButton>
            </Tooltip>

            <Box
              component="h1"
              sx={{
                fontSize: '22px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: '#000',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '200px', sm: '300px', md: '400px' },
              }}
            >
              {currentPage}
            </Box>
          </Stack>

          {/* RIGHT SIDE (MobileNav + UserCircle) */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton
              onClick={() => { setOpenNav(true) }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>

            {/* ✅ Changed Avatar to UserCircle */} 
            <IconButton
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              //sx={{ p: 0 }}
            >
              <img
                src="/assets/logout2.png" // assuming the image is in 'public/assets/logout.png'
                alt="logout"
                width={42}
                height={42}
                style={{
                  //borderRadius: '50%',
                  //filter: 'brightness(0.9) contrast(0.9)', // enhances color slightly
                }}
              />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav onClose={() => { setOpenNav(false) }} open={openNav} />
    </React.Fragment>
  );
}
