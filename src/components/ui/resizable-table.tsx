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
}

export function ResizableHeader({
  children,
  className,
  minWidth = 50,
  defaultWidth,
  onClick,
}: ResizableHeaderProps) {
  const [width, setWidth] = useState<number | undefined>(defaultWidth);
  const [resizing, setResizing] = useState(false);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  const headerRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!defaultWidth && headerRef.current) {
      setWidth(headerRef.current.offsetWidth);
    }
  }, [defaultWidth]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    startX.current = e.clientX;
    if (headerRef.current) {
      startWidth.current = headerRef.current.offsetWidth;
    }
    setResizing(true);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (resizing) {
      const diffX = e.clientX - startX.current;
      const newWidth = Math.max(minWidth, startWidth.current + diffX);
      setWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <th
      ref={headerRef}
      className={cn(
        "relative px-2 py-1 text-left text-xs font-medium text-[#6b7280] dark:text-gray-300 uppercase tracking-wider group",
        className,
      )}
      style={{ width: width ? `${width}px` : undefined }}
      onClick={onClick}
    >
      <div className="flex items-center">{children}</div>
      <div
        className={cn(
          "absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-blue-500 hover:opacity-100 transition-opacity",
          resizing && "opacity-100 bg-blue-500",
        )}
        onMouseDown={handleMouseDown}
      />
    </th>
  );
}
