"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const hideNavs = pathname === "/login" || pathname === "/signup";

  return (
    <Box sx={{ minHeight: "100vh", display: "block", overflow: "hidden" }} className="metabo-bg">
      {!hideNavs && <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          pl: { xs: 0, md: hideNavs ? 0 : (isSidebarExpanded ? "260px" : "70px") }, // Dynamically adjust content padding
          transition: "padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {!hideNavs && <TopNav />}
        <Box sx={{ flex: 1, px: { xs: 2, md: 5 }, pb: 6 }}>{children}</Box>
      </Box>
    </Box>
  );
}
