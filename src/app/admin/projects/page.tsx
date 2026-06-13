"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";

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

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("id, title, category, is_published, created_at, display_order")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    
    if (data) setProjects(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", id);
    setProjects(projects.filter(p => p.id !== id));
  }

  async function moveProject(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === projects.length - 1) return;

    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap in array
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;

    // Update display_order based on array position
    const updatedProjects = newProjects.map((p, idx) => ({ ...p, display_order: idx }));
    setProjects(updatedProjects);

    // Sync to DB (update just the two swapped items to be safe and fast)
    await Promise.all([
      supabase.from("projects").update({ display_order: targetIndex }).eq("id", temp.id),
      supabase.from("projects").update({ display_order: index }).eq("id", newProjects[index].id)
    ]);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Projects</h1>
        <button 
          onClick={() => { window.location.href = "/admin/projects/new"; }}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-sm tracking-wider uppercase bg-white/5">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Order / Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No projects found.</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{project.title}</td>
                  <td className="p-4 capitalize">{project.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${project.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {project.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2 items-center">
                    <div className="flex flex-col gap-1 mr-4">
                      <button 
                        onClick={() => moveProject(projects.findIndex(p => p.id === project.id), 'up')}
                        className="p-1 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                        disabled={projects.findIndex(p => p.id === project.id) === 0}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        onClick={() => moveProject(projects.findIndex(p => p.id === project.id), 'down')}
                        className="p-1 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                        disabled={projects.findIndex(p => p.id === project.id) === projects.length - 1}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <Link href={`/admin/projects/${project.id}`} className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
