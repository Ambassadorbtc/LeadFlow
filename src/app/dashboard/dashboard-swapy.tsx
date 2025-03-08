"use client";

import { useEffect } from "react";
import Swapy from "@/utils/swapy";

export default function DashboardSwapy() {
  useEffect(() => {
    // Initialize Swapy when the component mounts
    const swapy = new Swapy({
      selector: "[data-section-id]", // Target all draggable sections
      handleSelector: ".drag-handle",
      swapThreshold: 100, // Distance in pixels to trigger a swap
    });

    // Load any saved order from localStorage
    swapy.loadOrderFromStorage();

    // Listen for swap events
    const handleSwap = () => {
      // Dispatch a custom event that other components can listen for
      window.dispatchEvent(new CustomEvent("section-order-changed"));
    };

    window.addEventListener("swapy:swap", handleSwap);

    // Clean up when the component unmounts
    return () => {
      swapy.destroy();
      window.removeEventListener("swapy:swap", handleSwap);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
