"use client";

import { useState, useEffect } from "react";

interface DashboardContainerProps {
  children: React.ReactNode;
}

export default function DashboardContainer({
  children,
}: DashboardContainerProps) {
  const [layout, setLayout] = useState<string[]>([]);

  // Load layout from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLayout = localStorage.getItem("dashboard-layout");
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout);
          setLayout(parsedLayout);
        } catch (e) {
          console.error("Error parsing saved layout", e);
        }
      }
    }
  }, []);

  // Save layout to localStorage when it changes
  useEffect(() => {
    if (layout.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("dashboard-layout", JSON.stringify(layout));
    }
  }, [layout]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div
        className="flex flex-col"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {children}
      </div>
    </div>
  );
}
