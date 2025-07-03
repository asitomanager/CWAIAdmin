"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import GlobalStyles from "@mui/material/GlobalStyles";

import { AuthGuard } from "@/components/auth/auth-guard";
import { MainNav } from "@/components/dashboard/layout/main-nav";
import { SideNav } from "@/components/dashboard/layout/side-nav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <AuthGuard>
      <GlobalStyles
        styles={{
          html: { height: "100%" },
          body: {
            height: "100%",
            overflowX: "hidden", // Prevents unwanted horizontal scroll
            "--MainNav-height": "56px",
            "--MainNav-zIndex": 1000,
            "--SideNav-width": "240px",
            "--SideNav-zIndex": 1000,
            "--MobileNav-width": "320px",
            "--MobileNav-zIndex": 1100,
          },
        }}
      />
      
      <Box sx={{ display: "flex", flexDirection: "row", minHeight: "100vh" }}>
        {/* Sidebar with Toggle Support */}
        <SideNav isSidebarOpen={isSidebarOpen} />

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            transition: "margin-left 0.3s ease-in-out",
            ml: { lg: isSidebarOpen ? "var(--SideNav-width)" : "70px" }, // Adjust correctly
            minHeight: "100vh", // Prevents page shrink causing scrollbar
            overflow: "hidden", // Prevents scrolling issues
          }}
        >
          <Box sx={{ backgroundColor: "#f2f2f2" }}>
            <MainNav isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          </Box>
          <main>
            <Container maxWidth="xl" sx={{ py: "4px" }}>
              {children}
            </Container>
          </main>
        </Box>
      </Box>
    </AuthGuard>
  );
}