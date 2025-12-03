"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@lib/utils";

interface PremiumSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const PremiumSwitch: React.FC<PremiumSwitchProps> = ({
  checked,
  onCheckedChange,
  disabled,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-input",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={() => !disabled && onCheckedChange(!checked)}
    >
      <motion.span
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full bg-background shadow-lg ring-0"
        )}
        animate={{
          x: checked ? 20 : 0,
        }}
      />
    </div>
  );
};
