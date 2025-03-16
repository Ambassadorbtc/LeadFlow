"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import { usePathname } from "next/navigation";

export default function MobileNavigation() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Initial check
      checkIfMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkIfMobile);

      // Clean up event listener
      return () => window.removeEventListener("resize", checkIfMobile);
    }
  }, []);

  // Close the mobile menu when the path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="h-full">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
