"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { AppNav } from "@/components/app-nav";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Calculator,
  DollarSign,
  Truck,
  PiggyBank,
  Plus,
  Sparkles,
  Receipt,
  Rocket,
  BarChart3,
  Target,
  Users,
  FileText,
  Swords,
  GitBranch,
  ClipboardCheck,
  LayoutGrid,
} from "lucide-react";

const TOOLS = [
  { name: "Revenue Projector", slug: "revenue_projector", path: "/tools/revenue-projector", icon: TrendingUp },
  { name: "Unit Economics", slug: "unit_economics", path: "/tools/unit-economics", icon: Calculator },
  { name: "Pricing Strategy", slug: "pricing_calculator", path: "/tools/pricing-calculator", icon: DollarSign },
  { name: "Supplier Matrix", slug: "supplier_matrix", path: "/tools/supplier-matrix", icon: Truck },
  { name: "Cash Flow Forecast", slug: "cash_flow", path: "/tools/cash-flow", icon: PiggyBank },
  { name: "Expense Tracker", slug: "expense_tracker", path: "/tools/expense-tracker", icon: Receipt },
  { name: "Fundraising & Runway", slug: "fundraising", path: "/tools/fundraising", icon: Rocket },
  { name: "Market Sizing", slug: "market_sizing", path: "/tools/market-sizing", icon: BarChart3 },
  { name: "Break-Even Analyzer", slug: "break_even", path: "/tools/break-even", icon: Target },
  { name: "Customer Acquisition", slug: "acquisition_planner", path: "/tools/acquisition-planner", icon: Users },
  { name: "P&L Statement", slug: "pl_statement", path: "/tools/pl-statement", icon: FileText },
  { name: "Competitor Scorecard", slug: "competitor_scorecard", path: "/tools/competitor-scorecard", icon: Swords },
  { name: "Scenario Planner", slug: "scenario_planner", path: "/tools/scenario-planner", icon: GitBranch },
  { name: "Launch Checklist", slug: "launch_checklist", path: "/tools/launch-checklist", icon: ClipboardCheck },
  { name: "Business Model Canvas", slug: "business_model_canvas", path: "/tools/business-model-canvas", icon: LayoutGrid },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [activeTab, setActiveTab] = useState<"projects" | "tools">("projects");

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch projects once when user is ready
  const fetchProjects = useCallback(async () => {
    try {
      const data = await api.listProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setProjectsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Create project
  const handleCreateProject = async () => {
    if (!newProjectName.trim() || creating) return;
    setCreating(true);
    try {
      await api.createProject(newProjectName, newProjectDesc);
      setNewProjectName("");
      setNewProjectDesc("");
      setShowNewProject(false);
      await fetchProjects();
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setCreating(false);
    }
  };

  // Loading state
  if (authLoading || (!projectsLoaded && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-charcoal">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
      </div>
    );
  }

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-charcoal pb-20 pt-24">
      <AppNav />

      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Hey, {userName}
          </h1>
          <p className="mt-1 text-sm text-muted">
            What are you building today?
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/[0.06] pb-px">
          <button
            onClick={() => setActiveTab("projects")}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "projects" ? "text-cream" : "text-muted hover:text-cream/70"
            }`}
          >
            {activeTab === "projects" && (
              <div className="absolute inset-x-0 -bottom-px h-0.5 bg-amber" />
            )}
            Projects
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "tools" ? "text-cream" : "text-muted hover:text-cream/70"
            }`}
          >
            {activeTab === "tools" && (
              <div className="absolute inset-x-0 -bottom-px h-0.5 bg-amber" />
            )}
            Tools
          </button>
        </div>

        {/* Projects tab */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            {/* New project toggle */}
            {!showNewProject ? (
              <button
                onClick={() => setShowNewProject(true)}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-white/[0.1] px-4 py-3 text-sm text-muted transition-colors hover:border-amber/30 hover:text-cream"
              >
                <Plus className="h-4 w-4" />
                New Project
              </button>
            ) : (
              <div className="rounded-xl border border-white/[0.08] bg-charcoal-light p-4">
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name (e.g. Lumber Business)"
                  className="mb-2 w-full rounded-lg border border-white/[0.08] bg-charcoal-lighter px-3 py-2 text-sm text-cream outline-none focus:border-amber/40"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  autoFocus
                />
                <input
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Brief description (optional)"
                  className="mb-3 w-full rounded-lg border border-white/[0.08] bg-charcoal-lighter px-3 py-2 text-sm text-cream outline-none focus:border-amber/40"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={creating || !newProjectName.trim()}
                    className="rounded-lg bg-amber px-4 py-2 text-xs font-semibold text-charcoal disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewProject(false);
                      setNewProjectName("");
                      setNewProjectDesc("");
                    }}
                    className="rounded-lg px-4 py-2 text-xs text-muted hover:text-cream"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {projects.length === 0 && !showNewProject && (
              <div className="py-12 text-center">
                <p className="text-muted">No projects yet.</p>
                <p className="mt-1 text-sm text-muted/60">
                  Create your first project to get started.
                </p>
              </div>
            )}

            {/* Project list */}
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Tools tab */}
        {activeTab === "tools" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link key={tool.slug} href={tool.path}>
                <CardSpotlight className="cursor-pointer transition-all hover:border-amber/20">
                  <tool.icon className="mb-3 h-6 w-6 text-amber" />
                  <h3 className="font-display text-sm font-semibold text-cream">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted">Open tool →</p>
                </CardSpotlight>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const completedTools = project.completed_tools || [];
  const instanceCount = project.instance_count || 0;
  const totalTools = TOOLS.length;
  const progress = (completedTools.length / totalTools) * 100;

  return (
    <Link href={`/dashboard/${project.id}`}>
      <CardSpotlight className="cursor-pointer transition-all hover:border-amber/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-cream">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-0.5 text-xs text-muted">{project.description}</p>
            )}
          </div>
          <span onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/recommendations?project=${project.id}`}
              className="flex items-center gap-1 rounded-lg bg-amber/10 px-3 py-1.5 text-xs font-medium text-amber transition-colors hover:bg-amber/20"
            >
              <Sparkles className="h-3 w-3" />
              Recommendations
            </Link>
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>
              {completedTools.length}/{totalTools} tools used
            </span>
            <span>
              {instanceCount} {instanceCount === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-charcoal-lighter">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber/60 to-amber transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tool status pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TOOLS.map((tool) => (
            <span
              key={tool.slug}
              className={`rounded-full px-2.5 py-1 text-xs ${
                completedTools.includes(tool.slug)
                  ? "bg-amber/10 text-amber"
                  : "bg-charcoal-lighter text-muted/60"
              }`}
            >
              {tool.name}
            </span>
          ))}
        </div>
      </CardSpotlight>
    </Link>
  );
}
