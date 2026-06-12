"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Film, Image as ImageIcon, Eye, Plus, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ films: 0, creative: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data: projects } = await supabase.from("projects").select("category, is_published");
      if (projects) {
        setStats({
          films: projects.filter((p) => p.category === "film").length,
          creative: projects.filter((p) => p.category === "creative").length,
          published: projects.filter((p) => p.is_published).length,
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 font-light">Welcome back, Omar.</p>
        </div>
        <button
          onClick={() => { window.location.href = "/admin/projects/new"; }}
          className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {[
          { label: "Films", value: stats.films, Icon: Film, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Creative", value: stats.creative, Icon: ImageIcon, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Published", value: stats.published, Icon: Eye, color: "text-green-400", bg: "bg-green-500/10" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4">
            <div className={`p-3 ${bg} ${color} rounded-lg`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className="text-3xl font-bold">{loading ? "—" : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => { window.location.href = "/admin/projects/new"; }}
          className="group flex items-center justify-between bg-white/5 border border-white/10 hover:border-white/30 rounded-xl p-6 text-left transition-all duration-200"
        >
          <div>
            <p className="font-semibold text-white mb-1">Add New Project</p>
            <p className="text-gray-500 text-sm font-light">Upload a film or creative project</p>
          </div>
          <ArrowRight size={20} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
        </button>

        <button
          onClick={() => { window.location.href = "/admin/settings"; }}
          className="group flex items-center justify-between bg-white/5 border border-white/10 hover:border-white/30 rounded-xl p-6 text-left transition-all duration-200"
        >
          <div>
            <p className="font-semibold text-white mb-1">Update Hero Image</p>
            <p className="text-gray-500 text-sm font-light">Change your homepage background</p>
          </div>
          <ArrowRight size={20} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
        </button>
      </div>
    </div>
  );
}
