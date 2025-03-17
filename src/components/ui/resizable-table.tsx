"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

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
        Hover over column edges and drag to resize. Drag column headers to
        reorder.
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
  index?: number;
  onReorder?: (dragIndex: number, dropIndex: number) => void;
}

export function ResizableHeader({
  children,
  className,
  minWidth = 0,
  defaultWidth,
  initialWidth,
  onClick,
  allowOverlap = true, // Set default to true to allow overlap
  index,
  onReorder,
}: ResizableHeaderProps) {
  const [width, setWidth] = useState<number | undefined>(
    initialWidth || defaultWidth,
  );
  const [resizing, setResizing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  const headerRef = useRef<HTMLTableCellElement>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (initialWidth) {
      setWidth(initialWidth);
    } else if (!width && headerRef.current) {
      setWidth(headerRef.current.offsetWidth);
    }
  }, [initialWidth, width]);

  // Resize functionality
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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizing) {
        e.preventDefault();
        e.stopPropagation();
        const diffX = e.clientX - startX.current;
        let newWidth = startWidth.current + diffX;

        // Allow full resizing with no minimum width
        newWidth = Math.max(0, newWidth);

        setWidth(newWidth);

        if (headerRef.current) {
          headerRef.current.style.width = `${newWidth}px`;
        }
      }
    },
    [resizing],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(false);
      document.removeEventListener("mousemove", handleMouseMove, {
        capture: true,
      });
      document.removeEventListener("mouseup", handleMouseUp, { capture: true });
    },
    [handleMouseMove],
  );

  // Drag and drop functionality for column reordering
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (typeof index === "number" && onReorder) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
      dragIndex.current = index;
      setDragging(true);

      // Add a delay to set opacity to avoid flickering
      setTimeout(() => {
        if (headerRef.current) {
          headerRef.current.style.opacity = "0.5";
        }
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (typeof index === "number" && onReorder) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (typeof index === "number" && onReorder) {
      e.preventDefault();
      if (headerRef.current) {
        headerRef.current.classList.add("bg-blue-50", "dark:bg-blue-900/20");
      }
    }
  };

  const handleDragLeave = () => {
    if (headerRef.current) {
      headerRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/20");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (typeof index === "number" && onReorder && dragIndex.current !== null) {
      e.preventDefault();
      const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (sourceIndex !== index) {
        onReorder(sourceIndex, index);
      }
      if (headerRef.current) {
        headerRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/20");
      }
    }
  };

  const handleDragEnd = () => {
    setDragging(false);
    if (headerRef.current) {
      headerRef.current.style.opacity = "1";
      headerRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/20");
    }
    dragIndex.current = null;
  };

  return (
    <th
      ref={headerRef}
      className={cn(
        "relative px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider group",
        className,
        dragging && "opacity-50",
      )}
      style={{
        width: width ? `${width}px` : undefined,
        minWidth: 0,
        maxWidth: "none",
        position: "relative",
        zIndex: resizing ? 10 : "auto",
        cursor: typeof index === "number" && onReorder ? "grab" : undefined,
      }}
      onClick={onClick}
    >
      <div
        className="flex items-center"
        draggable={typeof index === "number" && onReorder}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        {typeof index === "number" && onReorder && (
          <GripVertical className="h-3 w-3 mr-1 text-gray-400 cursor-grab" />
        )}
        {children}
      </div>
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
