import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const revalidate = 60;

export const metadata = {
  title: "Creative Projects | Omar Shady",
  description: "Creative photography and visual art projects by Omar Shady.",
};

export default async function CreativeProjectsPage() {
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("category", "creative")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="pt-28 md:pt-36 px-6 md:px-14 max-w-7xl mx-auto w-full min-h-screen pb-20 md:pb-24">

      {/* Header */}
      <div className="mb-10 md:mb-16 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-black/10 pb-8 md:pb-10">
        <div>
          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-2 md:mb-3">Selected Work</p>
          <h1 className={`text-4xl md:text-7xl font-bold leading-none text-black ${playfair.className}`}>Creative</h1>
        </div>
        {projects && projects.length > 0 && (
          <p className="text-gray-500 text-xs tracking-widest uppercase">{projects.length} {projects.length === 1 ? "project" : "projects"}</p>
        )}
      </div>

      {projects && projects.length > 0 ? (
        /* Clean 3-column Symmetrical Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {projects.map((project, index) => (
            <Link
              href={`/project/${project.id}`}
              key={project.id}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden mb-4 bg-black/5">
                <img
                  src={project.cover_image_url || "/placeholder-creative.jpg"}
                  alt={project.title}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-1000 ease-out"
                />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className={`text-base md:text-xl font-bold tracking-wide uppercase text-black group-hover:opacity-60 transition-opacity duration-300 ${playfair.className}`}>
                  {project.title}
                </h2>
                <p className="text-xs tracking-[0.2em] text-gray-500 uppercase shrink-0">{project.year}</p>
              </div>
              {project.role && <p className="text-[10px] tracking-[0.15em] text-gray-500 uppercase mt-1">{project.role}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center animate-fade-in-up animation-delay-200">
          <p className="text-gray-500 text-sm tracking-[0.3em] uppercase">No projects published yet</p>
          <p className="text-gray-400 text-xs mt-2">Check back soon.</p>
        </div>
      )}
    </div>
  );
}
