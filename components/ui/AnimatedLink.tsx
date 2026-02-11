"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AnimatedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "underline";
}

export const AnimatedLink: React.FC<AnimatedLinkProps> = ({
  href,
  children,
  className,
  variant = "default",
  ...props
}) => {
  if (variant === "underline") {
    return (
      <Link
        href={href}
        className={cn(
          "text-sm text-gray-700 dark:text-gray-300 hover:text-primary transition-colors relative group inline-block",
          className
        )}
        {...props}
      >
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};
