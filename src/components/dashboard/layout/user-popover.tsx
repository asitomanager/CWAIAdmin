'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { LockKey, SignOut } from '@phosphor-icons/react/dist/ssr'; // ✅ New icons here

import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const [loginUser, setLoginUser] = React.useState<string | null>(null);
  const { checkSession } = useUser();
  const router = useRouter();

  const fetchUserName = React.useCallback(() => {
    const storedName = localStorage.getItem('app_user_name');
    setLoginUser(storedName ?? 'Guest');
  }, []);

  React.useEffect(() => {
    fetchUserName();
  }, [fetchUserName]);

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem('app_access_token');
      const refreshToken = localStorage.getItem('app_refresh_token');

      if (!accessToken || !refreshToken) {
        logger.error('No tokens found for logout');
        return;
      }

      const response = await fetch(paths.urls.logout, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'access-token': accessToken.replace(/^"|"$/g, ''),
          'refresh-token': refreshToken.replace(/^"|"$/g, ''),
        },
      });

      if (!response.ok) {
        logger.error('Backend logout failed', await response.text());
      }

      const { error } = await authClient.signOut();
      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      localStorage.removeItem('app_access_token');
      localStorage.removeItem('app_refresh_token');
      localStorage.removeItem('app_user_name');
      setLoginUser(null);

      await checkSession?.();
      router.refresh();
      onClose();
    } catch (err) {
      logger.error('Sign out error', err);
    }
  }, [checkSession, router, onClose]);

  const handleChangePassword = () => {
    router.push(paths.dashboard.changepassword);
    onClose();
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px' }}>
        <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
          {loginUser}
        </Typography>
      </Box>
      <Divider />
      <MenuItem onClick={handleChangePassword} sx={{ fontFamily: 'Poppins, sans-serif' }}>
        <ListItemIcon>
          <LockKey fontSize="var(--icon-fontSize-md)" />
        </ListItemIcon>
        Change Password
      </MenuItem>
      <MenuItem onClick={handleSignOut} sx={{ fontFamily: 'Poppins, sans-serif' }}>
        <ListItemIcon>
          <SignOut fontSize="var(--icon-fontSize-md)" />
        </ListItemIcon>
        Sign out
      </MenuItem>
    </Popover>
  );
}
