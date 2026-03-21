"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tab {
  title: string;
  value: string;
  content: React.ReactNode;
}

export function Tabs({
  tabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value);

  return (
    <div className={cn("w-full", containerClassName)}>
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/[0.06] pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.value
                ? "text-cream"
                : "text-muted hover:text-cream/70",
              tabClassName
            )}
          >
            {activeTab === tab.value && (
              <motion.div
                layoutId="active-tab"
                className={cn(
                  "absolute inset-x-0 -bottom-px h-0.5 bg-amber",
                  activeTabClassName
                )}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {tab.title}
          </button>
        ))}
      </div>
      <div className={cn("", contentClassName)}>
        {tabs.map((tab) =>
          tab.value === activeTab ? (
            <motion.div
              key={tab.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tab.content}
            </motion.div>
          ) : null
        )}
      </div>
    </div>
  );
}
