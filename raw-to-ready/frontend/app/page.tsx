"use client";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { MovingBorder } from "@/components/ui/moving-border";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <BackgroundBeams />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        {/* Raw → Ready transformation indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-muted">
            raw
          </span>
          <div className="relative h-px w-24">
            <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-amber to-cream/60" />
            <motion.div
              className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber"
              animate={{ x: ["-96px", "0px"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <span className="font-display text-sm uppercase tracking-[0.3em] text-cream">
            ready
          </span>
        </div>

        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          From{" "}
          <span className="text-muted/60">raw idea</span> to{" "}
          <span className="text-amber">ready to launch</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl font-body text-lg leading-relaxed text-muted">
          Plan your business with real tools — revenue projectors, pricing
          calculators, supplier matrices — and get matched with the right
          software to make it happen.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/login">
            <MovingBorder
              as="div"
              className="cursor-pointer px-8 py-3 font-display text-sm font-semibold tracking-wide"
            >
              Get Started Free
            </MovingBorder>
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 text-sm text-muted transition-colors hover:text-cream"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 mt-20 flex flex-wrap justify-center gap-3"
      >
        {[
          "Revenue Projector",
          "Unit Economics",
          "Pricing Strategy",
          "Supplier Matrix",
          "Cash Flow Forecast",
        ].map((tool) => (
          <div
            key={tool}
            className="rounded-full border border-white/[0.06] bg-charcoal-light px-4 py-2 text-xs text-muted"
          >
            {tool}
          </div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="relative z-10 mt-16 text-center text-xs tracking-widest text-muted/40"
      >
        NO AI. JUST SMART TOOLS &amp; THE RIGHT RECOMMENDATIONS.
      </motion.p>
    </div>
  );
}
