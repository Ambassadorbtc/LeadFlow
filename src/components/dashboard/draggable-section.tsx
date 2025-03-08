"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
// import { motion } from "framer-motion";

interface DraggableSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  defaultPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  id: string;
}

export default function DraggableSection({
  children,
  title,
  className,
  defaultPosition = { x: 0, y: 0 },
  onPositionChange,
  id,
}: DraggableSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [order, setOrder] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const allSections = useRef<Map<string, HTMLElement>>(new Map());

  // Load position and order from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load position
      const savedPosition = localStorage.getItem(`section-position-${id}`);
      if (savedPosition) {
        try {
          const parsedPosition = JSON.parse(savedPosition);
          setPosition(parsedPosition);
        } catch (e) {
          console.error("Error parsing saved position", e);
        }
      }

      // Load order
      const savedOrder = localStorage.getItem(`section-order-${id}`);
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          setOrder(parsedOrder);
        } catch (e) {
          console.error("Error parsing saved order", e);
        }
      } else {
        // Set default order based on id
        if (id === "pipeline-overview") setOrder(1);
        if (id === "sales-growth") setOrder(0);
        if (id === "recent-activity") setOrder(2);
      }
    }
  }, [id]);

  // Save position and order to localStorage when they change
  useEffect(() => {
    if (!isDragging && typeof window !== "undefined") {
      // Always save with y=0 to ensure sections stack properly
      localStorage.setItem(
        `section-position-${id}`,
        JSON.stringify({ ...position, y: 0 }),
      );
      localStorage.setItem(`section-order-${id}`, JSON.stringify(order));
      if (onPositionChange) {
        onPositionChange({ ...position, y: 0 });
      }
    }
  }, [position, order, isDragging, id, onPositionChange]);

  // Listen for section order changes
  useEffect(() => {
    const handleOrderChange = () => {
      if (typeof window !== "undefined") {
        // The order will be managed by Swapy.js now
        // Just reset position when order changes
        setPosition({ x: 0, y: 0 });
      }
    };

    // Listen for custom event for immediate updates
    window.addEventListener("section-order-changed", handleOrderChange);
    return () => {
      window.removeEventListener("section-order-changed", handleOrderChange);
    };
  }, [id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("drag-handle")) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = 0; // Lock X position to 0 for vertical-only movement
    const newY = e.clientY - startPos.y;

    // Update position
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Check for section overlaps and swap if needed
    if (sectionRef.current) {
      const currentRect = sectionRef.current.getBoundingClientRect();
      const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2,
      };

      // Find all other draggable sections
      let swapped = false;
      const sections = [];

      // First collect all sections
      document.querySelectorAll("[data-section-id]").forEach((element) => {
        const sectionId = element.getAttribute("data-section-id");
        if (sectionId) {
          const rect = element.getBoundingClientRect();
          sections.push({
            id: sectionId,
            element,
            rect,
            center: {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            },
          });
        }
      });

      // Sort sections by vertical position
      sections.sort((a, b) => a.rect.top - b.rect.top);

      // Find current section index
      const currentIndex = sections.findIndex((s) => s.id === id);
      if (currentIndex !== -1) {
        // Find closest section based on dragged position
        let closestIndex = currentIndex;
        let closestDistance = Infinity;

        sections.forEach((section, index) => {
          if (index !== currentIndex) {
            const distance = Math.abs(currentCenter.y - section.center.y);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index;
            }
          }
        });

        // If we found a closer section and it's within threshold
        if (closestIndex !== currentIndex && closestDistance < 100) {
          // Get the orders of all sections
          const orders = {};
          for (const section of sections) {
            const orderStr = localStorage.getItem(
              `section-order-${section.id}`,
            );
            if (orderStr) {
              try {
                orders[section.id] = JSON.parse(orderStr);
              } catch (e) {
                console.error("Error parsing order", e);
                orders[section.id] = 0;
              }
            } else {
              orders[section.id] = 0;
            }
          }

          // Swap orders between current and closest
          const temp = orders[id];
          orders[id] = orders[sections[closestIndex].id];
          orders[sections[closestIndex].id] = temp;

          // Save all orders
          for (const sectionId in orders) {
            localStorage.setItem(
              `section-order-${sectionId}`,
              JSON.stringify(orders[sectionId]),
            );
          }

          // Force page refresh to apply changes
          window.location.reload();
        }
      }
    }

    // When dropping, snap to original position with y=0
    setPosition({ x: 0, y: 0 });

    // Force save position to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `section-position-${id}`,
        JSON.stringify({ x: 0, y: 0 }),
      );
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={sectionRef}
      data-section-id={id}
      className={cn(
        "bg-white rounded-lg shadow-sm overflow-hidden relative mb-8",
        isDragging ? "cursor-grabbing opacity-80" : "",
        className,
      )}
      style={{
        zIndex: isDragging ? 10 : 1,
        order: order,
        transform: `translateY(${position.y}px)`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
      }}
      onMouseDown={handleMouseDown}
    >
      {title && (
        <div className="flex justify-between items-center p-4 border-b border-[#f3f4f6] drag-handle cursor-grab">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">{title}</h2>
          <div className="flex space-x-1">
            <button className="w-3 h-3 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb]"></button>
            <button className="w-3 h-3 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb]"></button>
            <button className="w-3 h-3 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb]"></button>
          </div>
        </div>
      )}
      <div className={title ? "" : "drag-handle cursor-grab"}>{children}</div>
    </div>
  );
}
