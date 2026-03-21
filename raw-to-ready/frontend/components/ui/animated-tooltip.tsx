"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function AnimatedTooltip({
  items,
}: {
  items: {
    id: number;
    name: string;
    image?: string;
    designation?: string;
  }[];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative"
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute -top-12 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-charcoal-lighter px-3 py-1.5 text-xs text-cream shadow-xl"
              >
                {item.name}
                {item.designation && (
                  <span className="ml-1 text-muted">
                    · {item.designation}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-charcoal-lighter text-sm font-bold text-amber transition-transform group-hover:scale-110">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              item.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
