'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { NavItemConfig } from '@/types/nav';
import { isNavItemActive } from '@/lib/is-nav-item-active';

import { navItems } from './config';
import { navIcons } from './nav-icons';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Drawer
      PaperProps={{
        sx: {
          background: "#40189d",
          color: "white",
          display: "flex",
          flexDirection: "column",
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          //borderTopRightRadius: '30px',
          //borderBottomRightRadius: '30px',
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <p style={{
              color: "red",
              fontFamily: "sans-serif",
              fontSize: "xx-large",
              fontWeight: 700,
              marginTop: "0px",
              marginBottom: 0 // prevent extra spacing
            }}>
              &lt;/&gt;
            </p>
            <p style={{
              fontFamily: "monospace",
              marginTop: "0px",
              fontWeight: 700,
              maxWidth: "180px",
              fontSize: "1.125rem",
              color: "#fff",
              marginBottom: 0
            }}>
              CAREERWINGS.AI
            </p>
          </Box>    
      </Stack>

      {/* <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} /> */}

      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: navItems })}
      </Box>

      {/* <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} /> */}
    </Drawer>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {items.map(({ key, ...itemProps }) => (
        <NavItem key={key} pathname={pathname} {...itemProps} />
      ))}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: '18px',
          color: active ? "#000000" : "rgba(255, 255, 255, 0.85)",
          backgroundColor: active ? '#f2f2f2' : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '10px 16px',
          position: 'relative',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap',
          fontWeight: 500,
          fontFamily: "'poppins', sans-serif",
          // '&:hover': {
          //   backgroundColor: '#f2f2f2',
          //   color: '#000000',
          //   transform: 'scale(1.02)',
          // },
          // '&::after': active ? {
          //   content: '""',
          //   position: 'absolute',
          //   top: 0,
          //   right: '-10px',
          //   width: '28px',
          //   height: '100%',
          //   backgroundColor: '#f2f2f2',
          //   color: "rgba(255, 255, 255, 0.85)",
          //   fontWeight: 500,
          //   fontFamily: "'poppins', sans-serif",
          //   zIndex: 1,
          // } : {},
        }}
      >
        {Icon && (
          <Icon fontSize="24px" fill={active ? '#000000' : 'rgba(255,255,255,0.7)'} weight={active ? 'fill' : undefined} />
        )}
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ fontFamily: "'poppins', sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              whiteSpace: "nowrap",}}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}