"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Chart with no SSR to avoid DOM mismatch issues
const Chart = dynamic(() => import("react-frappe-charts"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      Loading chart...
    </div>
  ),
});

type AnalyticsChartProps = {
  type: "bar" | "line" | "pie" | "percentage" | "heatmap";
  colors: string[];
  height: number;
  data: {
    labels: string[];
    datasets: any[];
  };
  axisOptions?: {
    xAxisMode?: string;
    yAxisMode?: string;
    xIsSeries?: boolean;
  };
  tooltipOptions?: {
    formatTooltipX?: (d: any) => string;
    formatTooltipY?: (d: any) => string;
  };
  lineOptions?: {
    dotSize?: number;
    hideLine?: number;
    hideDots?: number;
    heatline?: number;
    regionFill?: number;
    areaFill?: number;
  };
  chartKey?: string; // Add a key prop to force re-render
};

export default function AnalyticsChart(props: AnalyticsChartProps) {
  const [mounted, setMounted] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);

    // Cleanup function to prevent DOM errors
    return () => {
      setMounted(false);
      // Clear the container to prevent DOM errors
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  // Don't render anything during SSR or before hydration
  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading chart...
      </div>
    );
  }

  return (
    <div className="w-full h-full" ref={chartContainerRef}>
      <Chart {...props} />
    </div>
  );
}
