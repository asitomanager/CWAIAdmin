"use client";

import * as React from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

import type { NavItemConfig } from "@/types/nav";
import { isNavItemActive } from "@/lib/is-nav-item-active";

import { navItems } from "./config";
import { navIcons } from "./nav-icons";

interface SideNavProps {
  isSidebarOpen: boolean;
}

export function SideNav({ isSidebarOpen }: SideNavProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        background: "#40189d",
        color: "white",
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        height: "100vh",
        left: 0,
        position: "fixed",
        top: 0,
        width: isSidebarOpen ? "var(--SideNav-width)" : "70px",
        zIndex: "var(--SideNav-zIndex)",
        transition: "width 0.3s ease-in-out",
        overflow: "hidden",
        p: '-1px',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        {isSidebarOpen ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <p style={{
              color: "red",
              fontFamily: "sans-serif",
              fontSize: "xx-large",
              fontWeight: 700,
              marginTop: "5px",
              marginBottom: 0, // prevent extra spacing
              display: "flex",
              gap: "3px",
            }}>
              <Box component="span">&lt;</Box>
              <Box component="span">/</Box>
              <Box component="span">&gt;</Box>
            </p>
            <p style={{
              fontFamily: "monospace",
              marginTop: "5px",
              fontWeight: 700,
              maxWidth: "180px",
              fontSize: "1.125rem",
              color: "#fff",
              marginBottom: 0
            }}>
              CAREERWINGS.AI
            </p>
          </Box>        
        ) : (
          <Box sx={{ display: "flex" }}>
            <p style={{
              color: "red",
              fontFamily: "sans-serif",
              fontSize: "xx-large",
              fontWeight: 700,
              marginTop: "5px",
              marginBottom: 0, // prevent extra spacing
              display: "flex",
              gap: "3px",
            }}>
                <Box component="span">&lt;</Box>
                <Box component="span">/</Box>
                <Box component="span">&gt;</Box>
            </p>
          </Box>
        )}
      </Stack>

      {/* <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} /> */}
      
      <Box component="nav" sx={{ flex: "1 1 auto", p: "1px" }}>
        {renderNavItems({ pathname, items: navItems, isSidebarOpen })}
      </Box>

      {/* <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} /> */}
    </Box>
  );
}

// ✅ Fix: Add the `renderNavItems` function
function renderNavItems({
  items = [],
  pathname,
  isSidebarOpen,
}: {
  items?: NavItemConfig[];
  pathname: string;
  isSidebarOpen: boolean;
}): React.JSX.Element {
  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {items.map(({ key, ...itemProps }) => (
        <NavItem key={key} pathname={pathname} isSidebarOpen={isSidebarOpen} {...itemProps} />
      ))}
    </Stack>
  );
}

// ✅ Fix: Ensure `NavItem` is defined
interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
  isSidebarOpen: boolean;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title, isSidebarOpen }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Tooltip title={!isSidebarOpen ? title : ""} placement="right">
        <Box
          component={external ? "a" : RouterLink}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          sx={{
            display: "flex",
            alignItems: "center",
            color: active ? "#000000" : "rgba(255, 255, 255, 0.85)",
            backgroundColor: active ? "#f2f2f2" : "transparent",
            cursor: disabled ? "not-allowed" : "pointer",
            gap: 1,
            px: 2,
            py: 1.2,
            mx: 1,
            textDecoration: "none",
            position: "relative",
            overflowX: "visible",
            borderTopLeftRadius: "30px",
            borderBottomLeftRadius: "30px",
            transition: "all 0.3s ease, transform 0.2s ease",
            fontWeight: 500,
            fontFamily: "'poppins', sans-serif",
            // '&:hover': {
            //   backgroundColor: "#f2f2f2",
            //   color: "#000000",
            //   borderTopRightRadius: "45px",
            //   borderBottomRightRadius: "45px",
            //   transform: "scale(1.02)",
            // },
            '&::after': active ? {
              content: '""',
              position: "absolute",
              top: 0,
              right: "-10px",        // ❗ move even more outside
              width: "25px",         // ❗ bigger width for bigger bump
              height: "100%",
              backgroundColor: "#f2f2f2",
              color: "rgba(255, 255, 255, 0.85)",
              fontWeight: 500,
              fontFamily: "'poppins', sans-serif",
              zIndex: 1,
            } : {},
          }}          
        >
          {Icon && <Icon fontSize="24px" />}
          {isSidebarOpen && (
            <Box
              component="span"
              sx={{
                fontFamily: 'poppins, sans-serif',
                fontSize: "16px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Box>
          )}
        </Box>
      </Tooltip>
    </li>
  );
}