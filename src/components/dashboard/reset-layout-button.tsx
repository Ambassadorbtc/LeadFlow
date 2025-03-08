"use client";

import { LayoutList } from "lucide-react";

export default function ResetLayoutButton() {
  const handleResetLayout = () => {
    // Reset all section positions and orders to default values
    const sections = [
      { id: "pipeline-overview", order: 1 },
      { id: "sales-growth", order: 0 },
      { id: "recent-activity", order: 2 },
    ];

    sections.forEach(({ id, order }) => {
      localStorage.setItem(
        `section-position-${id}`,
        JSON.stringify({ x: 0, y: 0 }),
      );
      localStorage.setItem(`section-order-${id}`, JSON.stringify(order));
    });

    // Trigger custom event to notify components
    window.dispatchEvent(new CustomEvent("section-order-changed"));

    // Reload the page to apply changes
    window.location.reload();
  };

  return (
    <button
      onClick={handleResetLayout}
      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors"
    >
      <LayoutList className="h-4 w-4" />
      <span>Reset Layout</span>
    </button>
  );
}
