"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizableTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResizableTable({ children, className }: ResizableTableProps) {
  return (
    <div className={cn("relative overflow-auto", className)}>
      <div className="mb-2 text-xs text-gray-500 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
        >
          <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
          <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
          <path d="M4 12H2" />
          <path d="M10 12H8" />
          <path d="M16 12h-2" />
          <path d="M22 12h-2" />
        </svg>
        Hover over column edges and drag to resize
      </div>
      <table className="w-full divide-y divide-[#f3f4f6] text-sm">
        {children}
      </table>
    </div>
  );
}

interface ResizableHeaderProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
  defaultWidth?: number;
  onClick?: () => void;
  initialWidth?: number;
  allowOverlap?: boolean;
}

export function ResizableHeader({
  children,
  className,
  minWidth = 30,
  defaultWidth,
  initialWidth,
  onClick,
  allowOverlap = false,
}: ResizableHeaderProps) {
  const [width, setWidth] = useState<number | undefined>(
    initialWidth || defaultWidth,
  );
  const [resizing, setResizing] = useState(false);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  const headerRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (initialWidth) {
      setWidth(initialWidth);
    } else if (!width && headerRef.current) {
      setWidth(headerRef.current.offsetWidth);
    }
  }, [initialWidth, width]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    if (headerRef.current) {
      startWidth.current = headerRef.current.offsetWidth;
    }
    setResizing(true);

    // Use capture phase to ensure we get all mouse events
    document.addEventListener("mousemove", handleMouseMove, { capture: true });
    document.addEventListener("mouseup", handleMouseUp, { capture: true });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing) {
      e.preventDefault();
      e.stopPropagation();
      const diffX = e.clientX - startX.current;
      let newWidth;

      if (allowOverlap) {
        // When overlap is allowed, don't enforce minimum width
        newWidth = startWidth.current + diffX;
      } else {
        // When overlap is not allowed, enforce minimum width
        newWidth = Math.max(minWidth, startWidth.current + diffX);
      }

      setWidth(newWidth);

      if (headerRef.current) {
        headerRef.current.style.width = `${newWidth}px`;
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(false);
    document.removeEventListener("mousemove", handleMouseMove, {
      capture: true,
    });
    document.removeEventListener("mouseup", handleMouseUp, { capture: true });
  };

  return (
    <th
      ref={headerRef}
      className={cn(
        "relative px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider group",
        className,
      )}
      style={{
        width: width ? `${width}px` : undefined,
        minWidth: allowOverlap ? 0 : `${minWidth}px`,
        position: "relative",
        zIndex: resizing ? 10 : "auto",
      }}
      onClick={onClick}
    >
      <div className="flex items-center">{children}</div>
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-4 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:opacity-100 transition-opacity",
          resizing && "opacity-100 bg-blue-500",
        )}
        onMouseDown={handleMouseDown}
        title="Drag to resize column"
        style={{ zIndex: 20 }}
      >
        <div className="absolute inset-y-0 right-0 w-1 bg-gray-300 opacity-50 group-hover:opacity-100 group-hover:bg-blue-400"></div>
      </div>
    </th>
  );
}
