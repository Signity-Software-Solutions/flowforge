"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Tooltip({
  children,
  content,
  side = "top",
  className,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="group relative inline-flex">
      {children}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 hidden overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md group-hover:block",
          positionClasses[side],
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}
Tooltip.displayName = "Tooltip";

export { Tooltip };
