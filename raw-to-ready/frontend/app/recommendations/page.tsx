"use client";

import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AppNav } from "@/components/app-nav";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Recommendation {
  tool_key: string;
  tool_name: string;
  category: string;
  reason: string;
  affiliate_link: string;
  has_link: boolean;
}

export default function RecommendationsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-charcoal">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
        </div>
      }
    >
      <RecommendationsPage />
    </Suspense>
  );
}

function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || "");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [breadcrumbCount, setBreadcrumbCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.listProjects().then((data) => {
        setProjects(data);
        if (!selectedProject && data.length > 0) {
          setSelectedProject(data[0].id);
        }
        setLoading(false);
      });
    }
  }, [user, selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);
      api
        .getRecommendations(selectedProject)
        .then((data) => {
          setRecommendations(data.recommendations || []);
          setBreadcrumbCount(data.breadcrumb_count || 0);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedProject]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
      </div>
    );
  }

  // Group recommendations by category
  const grouped: Record<string, Recommendation[]> = {};
  for (const rec of recommendations) {
    if (!grouped[rec.category]) grouped[rec.category] = [];
    grouped[rec.category].push(rec);
  }

  return (
    <div className="min-h-screen bg-charcoal pb-20 pt-24">
      <AppNav />

      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber" />
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Recommendations
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted">
            Tools recommended based on your business inputs.{" "}
            {breadcrumbCount > 0 && (
              <span className="text-amber">
                {breadcrumbCount} breadcrumb{breadcrumbCount !== 1 ? "s" : ""} collected.
              </span>
            )}
          </p>
        </motion.div>

        {/* Project selector */}
        <div className="mb-8">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-charcoal-lighter px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-amber/40"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-20 text-center">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted/30" />
            <p className="text-lg text-muted">No recommendations yet.</p>
            <p className="mt-2 text-sm text-muted/60">
              Start filling out business tools to unlock recommendations.
            </p>
            <Link
              href="/dashboard#tools"
              className="mt-4 inline-block text-sm text-amber underline underline-offset-2"
            >
              Open a tool →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, recs]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="mb-4 font-display text-lg font-semibold text-cream/80">
                  {category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recs.map((rec, i) => (
                    <motion.div
                      key={rec.tool_key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CardSpotlight className="flex h-full flex-col">
                        {/* Tool icon */}
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10 text-sm font-bold text-amber">
                          {rec.tool_name.charAt(0)}
                        </div>

                        <h3 className="font-display text-base font-semibold text-cream">
                          {rec.tool_name}
                        </h3>

                        <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">
                          {rec.reason}
                        </p>

                        {/* CTA */}
                        <div className="mt-4">
                          {rec.has_link ? (
                            <a
                              href={rec.affiliate_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2 text-xs font-semibold text-charcoal transition-colors hover:bg-amber-hover"
                            >
                              Try {rec.tool_name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <div className="rounded-lg border border-white/[0.06] bg-charcoal-lighter px-4 py-2 text-center text-xs text-muted/50">
                              Link coming soon
                            </div>
                          )}
                        </div>
                      </CardSpotlight>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
