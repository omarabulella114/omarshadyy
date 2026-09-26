"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Film, Image as ImageIcon, Eye, Plus, ArrowRight, FileEdit } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ films: 0, creative: 0, published: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from("projects").select("category, is_published");
      if (data) {
        setStats({
          films:     data.filter(p => p.category === "film").length,
          creative:  data.filter(p => p.category === "creative").length,
          published: data.filter(p => p.is_published).length,
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "Films",     value: stats.films,     Icon: Film,       color: "text-blue-400",   bg: "bg-blue-500/10"   },
    { label: "Creative",  value: stats.creative,   Icon: ImageIcon,  color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Published", value: stats.published,  Icon: Eye,        color: "text-green-400",  bg: "bg-green-500/10"  },
  ];

  const quickActions = [
    { label: "Add New Project",   sub: "Upload a film or creative project",   href: "/admin/projects/new", Icon: Plus      },
    { label: "Manage Projects",   sub: "Edit, reorder, or remove projects",   href: "/admin/projects",     Icon: FileEdit  },
    { label: "Update Hero Image", sub: "Change your homepage background",     href: "/admin/settings",     Icon: ImageIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 font-light">Welcome back, Omar.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {statCards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center gap-4">
            <div className={`p-3 ${bg} ${color} rounded-lg`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className="text-3xl font-bold">{loading ? "—" : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map(({ label, sub, href, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center justify-between bg-white/5 border border-white/10 hover:border-white/30 rounded-xl p-6 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
              <div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-gray-500 text-xs font-light mt-0.5">{sub}</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 shrink-0 ml-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}
