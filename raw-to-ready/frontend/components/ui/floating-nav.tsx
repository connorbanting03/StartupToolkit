"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

export function FloatingNav({
  navItems,
  className,
}: {
  navItems: NavItem[];
  className?: string;
}) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed inset-x-0 top-4 z-50 mx-auto flex max-w-fit items-center justify-center gap-1 rounded-full border border-white/[0.08] bg-charcoal/80 px-6 py-3 shadow-lg backdrop-blur-md",
        className
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.link}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted transition-colors hover:text-cream"
        >
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}
    </motion.nav>
  );
}
