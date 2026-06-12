import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const revalidate = 60;

export const metadata = {
  title: "Films | Omar Shady",
  description: "A curated selection of cinematic films directed and produced by Omar Shady.",
};

export default async function FilmsPage() {
  const { data: films } = await supabase
    .from("projects")
    .select("*")
    .eq("category", "film")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="pt-36 px-8 md:px-14 max-w-7xl mx-auto w-full min-h-screen pb-24">

      {/* Header */}
      <div className="mb-16 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-10">
        <div>
          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-3">Selected Work</p>
          <h1 className={`text-5xl md:text-7xl font-bold leading-none ${playfair.className}`}>Films</h1>
        </div>
        {films && films.length > 0 && (
          <p className="text-gray-600 text-sm tracking-widest uppercase">{films.length} {films.length === 1 ? "project" : "projects"}</p>
        )}
      </div>

      {films && films.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {films.map((film, index) => {
            const colSpan =
              index % 3 === 0
                ? "md:col-span-12 lg:col-span-8"
                : index % 3 === 1
                ? "md:col-span-6 lg:col-span-4 lg:mt-24"
                : "md:col-span-6 lg:col-span-6";

            return (
              <Link
                href={`/project/${film.id}`}
                key={film.id}
                className={`group block animate-fade-in-up ${colSpan}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden mb-5 bg-white/5">
                  <img
                    src={film.cover_image_url || "/placeholder-film.jpg"}
                    alt={film.title}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-1000 ease-out grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-700" />
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className={`text-xl md:text-2xl font-bold tracking-wide uppercase group-hover:opacity-60 transition-opacity duration-300 ${playfair.className}`}>
                    {film.title}
                  </h2>
                  <p className="text-xs tracking-[0.2em] text-gray-600 uppercase shrink-0">{film.year}</p>
                </div>
                {film.role && (
                  <p className="text-xs tracking-[0.15em] text-gray-600 uppercase mt-1">{film.role}</p>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up animation-delay-200">
          <p className="text-gray-600 text-sm tracking-[0.3em] uppercase">No films published yet</p>
          <p className="text-gray-700 text-xs mt-2">Check back soon.</p>
        </div>
      )}
    </div>
  );
}
