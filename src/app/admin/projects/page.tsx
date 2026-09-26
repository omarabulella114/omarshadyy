"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

type Project = {
  id: string;
  title: string;
  category: string;
  is_published: boolean;
  created_at: string;
  display_order: number;
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, category, is_published, created_at, display_order")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) {
      // Check if display_order has duplicates (broken state)
      const orders = data.map(p => p.display_order);
      const hasDuplicates = new Set(orders).size !== orders.length;

      if (hasDuplicates) {
        // Normalize all to sequential 0, 1, 2... and save to DB
        const normalized = data.map((p, idx) => ({ ...p, display_order: idx }));
        setProjects(normalized);
        await Promise.all(
          normalized.map(p =>
            supabase.from("projects").update({ display_order: p.display_order }).eq("id", p.id)
          )
        );
      } else {
        setProjects(data);
      }
    }

    if (error) console.error("Failed to fetch projects:", error.message);
    setLoading(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
    setDeletingId(null);
  }

  async function moveProject(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === projects.length - 1) return;

    const newProjects = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];

    // Assign fresh sequential display_order for every item
    const updated = newProjects.map((p, idx) => ({ ...p, display_order: idx }));
    setProjects(updated);

    // Save ALL positions — not just the two swapped — to keep DB perfectly in sync
    await Promise.all(
      updated.map(p =>
        supabase.from("projects").update({ display_order: p.display_order }).eq("id", p.id)
      )
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          <Plus size={18} />
          New Project
        </Link>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-xs tracking-wider uppercase bg-white/5">
              <th className="px-5 py-4 font-medium">Title</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium text-right">Order / Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500 mx-auto" />
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-500 text-sm">
                  No projects yet.{" "}
                  <Link href="/admin/projects/new" className="text-white underline">
                    Add your first one →
                  </Link>
                </td>
              </tr>
            ) : (
              projects.map((project, index) => (
                <tr key={project.id} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                  <td className="px-5 py-4 font-medium text-sm">{project.title}</td>
                  <td className="px-5 py-4 capitalize text-gray-400 text-sm">{project.category}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      project.is_published
                        ? "bg-green-500/15 text-green-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}>
                      {project.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1 items-center">
                      {/* Reorder */}
                      <div className="flex flex-col gap-0.5 mr-3">
                        <button
                          onClick={() => moveProject(index, "up")}
                          disabled={index === 0}
                          aria-label="Move up"
                          className="p-1 text-gray-600 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => moveProject(index, "down")}
                          disabled={index === projects.length - 1}
                          aria-label="Move down"
                          className="p-1 text-gray-600 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      {/* Edit */}
                      <Link
                        href={`/admin/projects/${project.id}`}
                        aria-label={`Edit ${project.title}`}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Edit size={16} />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        disabled={deletingId === project.id}
                        aria-label={`Delete ${project.title}`}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-colors disabled:opacity-50"
                      >
                        {deletingId === project.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <Trash2 size={16} />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && projects.length > 0 && (
        <p className="text-xs text-gray-600 mt-4 text-right">
          {projects.length} project{projects.length !== 1 ? "s" : ""} total
        </p>
      )}
    </div>
  );
}
