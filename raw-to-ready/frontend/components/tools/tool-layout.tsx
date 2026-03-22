"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { AppNav } from "@/components/app-nav";
import { api } from "@/lib/api";
import { useProjects, useToolInstances, invalidateProjects, invalidateProject } from "@/lib/hooks/use-api";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

interface ToolInstance {
  id: string;
  tool_name: string;
  label: string | null;
  input_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ToolLayoutProps {
  toolName: string;
  toolSlug: string;
  description: string;
  children: (props: {
    formData: Record<string, any>;
    setField: (key: string, value: any) => void;
    projectId: string | null;
  }) => React.ReactNode;
  outputSection?: (props: {
    formData: Record<string, any>;
  }) => React.ReactNode;
}

export function ToolLayout({
  toolName,
  toolSlug,
  description,
  children,
  outputSection,
}: ToolLayoutProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { instances, mutate: mutateInstances } = useToolInstances(toolSlug, selectedProject);
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [label, setLabel] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newKeywords, setNewKeywords] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Auto-select project from URL query param
  useEffect(() => {
    const projectParam = searchParams.get("project");
    if (projectParam && !selectedProject) {
      setSelectedProject(projectParam);
    }
  }, [searchParams, selectedProject]);

  // Auto-select instance from URL query param
  useEffect(() => {
    const instanceParam = searchParams.get("instance");
    if (instanceParam && instances.length > 0) {
      const inst = instances.find((i) => i.id === instanceParam);
      if (inst) {
        selectInstance(inst);
      }
    }
  }, [searchParams, instances]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Reset form when project changes
  useEffect(() => {
    if (selectedProject) {
      setActiveInstanceId(null);
      setIsNew(false);
      setFormData({});
      setLabel("");
    }
  }, [selectedProject]);

  const selectInstance = (inst: ToolInstance) => {
    setActiveInstanceId(inst.id);
    setFormData(inst.input_data || {});
    setLabel(inst.label || "");
    setIsNew(false);
    setSaved(false);
    setNewKeywords([]);
  };

  const startNew = () => {
    setActiveInstanceId(null);
    setFormData({});
    setLabel("");
    setIsNew(true);
    setSaved(false);
    setNewKeywords([]);
  };

  const duplicateInstance = (inst: ToolInstance) => {
    setActiveInstanceId(null);
    setFormData({ ...inst.input_data });
    setLabel(inst.label ? `${inst.label} (copy)` : "");
    setIsNew(true);
    setSaved(false);
    setNewKeywords([]);
  };

  const deleteInstance = async (instanceId: string) => {
    setDeleting(instanceId);
    try {
      await api.deleteToolInstance(toolSlug, instanceId);
      if (activeInstanceId === instanceId) {
        setActiveInstanceId(null);
        setFormData({});
        setLabel("");
        setIsNew(false);
      }
      await mutateInstances();
      invalidateProjects();
      if (selectedProject) invalidateProject(selectedProject);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  };

  const setField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedProject) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, any> = {
        ...formData,
        project_id: selectedProject,
        label: label || `${toolName} ${instances.length + 1}`,
      };
      if (activeInstanceId && !isNew) {
        payload.instance_id = activeInstanceId;
      }
      const result = await api.submitTool(toolSlug, payload);
      setSaved(true);
      setNewKeywords(result.matched_keywords || []);
      setIsNew(false);
      await mutateInstances();
      invalidateProjects();
      if (selectedProject) invalidateProject(selectedProject);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
      </div>
    );
  }

  const showForm = isNew || activeInstanceId;

  return (
    <div className="min-h-screen bg-charcoal pb-20 pt-24">
      <AppNav />

      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={
              selectedProject
                ? `/dashboard/${selectedProject}`
                : "/dashboard"
            }
            className="mb-4 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-cream"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {toolName}
          </h1>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </motion.div>

        {/* Project selector */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-medium text-muted">
            Select Project
          </label>
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="w-full rounded-xl border border-white/[0.08] bg-charcoal-lighter px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-amber/40"
          >
            <option value="">Choose a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Saved instances list + New button */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-muted">
                  Saved Entries ({instances.length})
                </p>
                <button
                  onClick={startNew}
                  className="flex items-center gap-1.5 rounded-lg bg-amber/10 px-3 py-1.5 text-xs font-medium text-amber transition-colors hover:bg-amber/20"
                >
                  <Plus className="h-3 w-3" />
                  New Entry
                </button>
              </div>

              {instances.length > 0 && (
                <div className="space-y-2">
                  {instances.map((inst) => (
                    <div
                      key={inst.id}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                        activeInstanceId === inst.id && !isNew
                          ? "border-amber/30 bg-amber/5"
                          : "border-white/[0.08] bg-charcoal-light hover:border-white/[0.12]"
                      }`}
                    >
                      <button
                        className="flex-1 text-left"
                        onClick={() => selectInstance(inst)}
                      >
                        <p className="text-sm font-medium text-cream">
                          {inst.label || `${toolName} entry`}
                        </p>
                        <p className="text-xs text-muted">
                          Last updated{" "}
                          {new Date(inst.updated_at).toLocaleDateString()}
                        </p>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateInstance(inst);
                          }}
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-cream"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectInstance(inst);
                          }}
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/[0.06] hover:text-cream"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteInstance(inst.id);
                          }}
                          disabled={deleting === inst.id}
                          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {instances.length === 0 && !isNew && (
                <div className="rounded-xl border border-dashed border-white/[0.1] p-6 text-center">
                  <p className="text-sm text-muted">
                    No entries yet for this tool.
                  </p>
                  <button
                    onClick={startNew}
                    className="mt-2 text-xs text-amber hover:underline"
                  >
                    Create your first entry →
                  </button>
                </div>
              )}
            </div>

            {/* Form (shown when editing or creating new) */}
            <AnimatePresence mode="wait">
              {showForm && (
                <motion.div
                  key={activeInstanceId || "new"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Label field */}
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-medium text-muted">
                      Entry Name
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder={`e.g. ${toolName} — Scenario A`}
                      className="w-full rounded-xl border border-white/[0.08] bg-charcoal-lighter px-4 py-2.5 text-sm text-cream outline-none transition-colors focus:border-amber/40"
                    />
                  </div>

                  {/* Form fields */}
                  <div className="rounded-2xl border border-white/[0.08] bg-charcoal-light p-6">
                    {children({
                      formData,
                      setField,
                      projectId: selectedProject,
                    })}
                  </div>

                  {/* Save button */}
                  <div className="mt-6 flex items-center gap-4">
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-amber-hover disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving
                        ? "Saving..."
                        : isNew
                        ? "Save New Entry"
                        : "Update Entry"}
                    </button>
                    {!isNew && (
                      <button
                        onClick={startNew}
                        className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-muted transition-colors hover:border-white/[0.15] hover:text-cream"
                      >
                        <Plus className="h-4 w-4" />
                        New Entry Instead
                      </button>
                    )}
                    {saved && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1 text-sm text-green-400"
                      >
                        <Check className="h-4 w-4" />
                        Saved!
                      </motion.span>
                    )}
                  </div>

                  {/* Breadcrumb results */}
                  {newKeywords.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 rounded-xl border border-amber/20 bg-amber/5 p-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-amber">
                        <Sparkles className="h-4 w-4" />
                        New recommendations unlocked!
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Keywords detected:{" "}
                        {newKeywords.map((kw) => `"${kw}"`).join(", ")}
                      </p>
                      <Link
                        href={`/recommendations?project=${selectedProject}`}
                        className="mt-2 inline-block text-xs text-amber underline underline-offset-2 hover:text-amber-hover"
                      >
                        View Recommendations →
                      </Link>
                    </motion.div>
                  )}

                  {/* Output section */}
                  {outputSection && (
                    <div className="mt-8">
                      <h2 className="mb-4 font-display text-xl font-bold">
                        Results
                      </h2>
                      <div className="rounded-2xl border border-white/[0.08] bg-charcoal-light p-6">
                        {outputSection({ formData })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
