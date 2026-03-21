"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({
  children,
  className,
  containerClassName,
  as: Component = "button",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  as?: any;
  [key: string]: any;
}) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-xl bg-transparent p-[1px]",
        containerClassName
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, #d47c2f 10%, transparent 20%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <div
        className={cn(
          "relative z-10 rounded-xl bg-charcoal px-6 py-3 text-cream",
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
}
