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
    <div className="pt-36 px-8 md:px-14 max-w-7xl mx-auto w-full min-h-screen pb-24">

      {/* Header */}
      <div className="mb-16 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-10">
        <div>
          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-3">Visual Work</p>
          <h1 className={`text-5xl md:text-7xl font-bold leading-none ${playfair.className}`}>Creative</h1>
        </div>
        {projects && projects.length > 0 && (
          <p className="text-gray-600 text-sm tracking-widest uppercase">{projects.length} {projects.length === 1 ? "project" : "projects"}</p>
        )}
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {projects.map((project, index) => {
            const colSpan =
              index % 2 === 0
                ? "md:col-span-12 lg:col-span-7"
                : "md:col-span-8 lg:col-span-5 lg:mt-24";

            return (
              <Link
                href={`/project/${project.id}`}
                key={project.id}
                className={`group block animate-fade-in-up ${colSpan}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden mb-5 bg-white/5">
                  <img
                    src={project.cover_image_url || "/placeholder-creative.jpg"}
                    alt={project.title}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-1000 ease-out grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-700" />
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className={`text-xl md:text-2xl font-bold tracking-wide uppercase group-hover:opacity-60 transition-opacity duration-300 ${playfair.className}`}>
                    {project.title}
                  </h2>
                  <p className="text-xs tracking-[0.2em] text-gray-600 uppercase shrink-0">{project.year}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up animation-delay-200">
          <p className="text-gray-600 text-sm tracking-[0.3em] uppercase">No creative projects published yet</p>
          <p className="text-gray-700 text-xs mt-2">Check back soon.</p>
        </div>
      )}
    </div>
  );
}
