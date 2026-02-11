import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
  ...props
}) => {
  const baseStyles = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 bg-[length:200%_100%]";

  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
    rounded: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={style}
      {...props}
    />
  );
};

// Pre-built skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-6 space-y-4", className)}>
    <Skeleton variant="rounded" height={24} width="60%" />
    <Skeleton variant="text" width="100%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="90%" />
  </div>
);

export const SkeletonResults: React.FC = () => (
  <div className="space-y-6">
    {/* Risk Meter Skeleton */}
    <div className="p-6 space-y-4">
      <Skeleton variant="circular" width={120} height={120} className="mx-auto" />
      <Skeleton variant="rounded" height={20} width="40%" className="mx-auto" />
    </div>

    {/* Findings Skeleton */}
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Skeleton variant="rounded" height={20} width="30%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </div>
      ))}
    </div>
  </div>
);
