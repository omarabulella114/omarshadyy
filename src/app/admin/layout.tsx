"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LayoutDashboard, Film, Settings, LogOut, Loader2, ExternalLink } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      } else if (pathname !== "/admin/login") {
        router.push("/admin/login");
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAuthenticated(true);
        if (pathname === "/admin/login") router.push("/admin");
      } else {
        setIsAuthenticated(false);
        if (pathname !== "/admin/login") router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <div className="bg-[#050505] min-h-screen">{children}</div>;
  }

  if (!isAuthenticated) return null;

  const navItems = [
    { label: "Overview", href: "/admin", Icon: LayoutDashboard, exact: true },
    { label: "Projects", href: "/admin/projects", Icon: Film, exact: false },
    { label: "Settings", href: "/admin/settings", Icon: Settings, exact: true },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 flex flex-col">
        {/* Brand */}
        <div className="px-6 py-7 border-b border-white/10">
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-1">Portfolio CMS</p>
          <p className="text-white font-bold tracking-wide">Omar Shady</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <button
                key={href}
                onClick={() => { window.location.href = href; }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  isActive
                    ? "bg-white text-black font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm tracking-wide">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <button
            onClick={() => { window.open("/", "_blank"); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors duration-200 text-left"
          >
            <ExternalLink size={18} />
            <span className="text-sm tracking-wide">View Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors duration-200 text-left"
          >
            <LogOut size={18} />
            <span className="text-sm tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
