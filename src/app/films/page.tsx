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
    .select("id, title, cover_image_url, cover_fit")
    .eq("category", "film")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="pt-28 md:pt-36 px-6 md:px-14 max-w-7xl mx-auto w-full min-h-screen pb-20 md:pb-24">

      {/* Header */}
      <div className="mb-10 md:mb-16 animate-fade-in-up flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-black/10 pb-8 md:pb-10">
        <div>
          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-2 md:mb-3">Selected Work</p>
          <h1 className={`text-4xl md:text-7xl font-bold leading-none text-black ${playfair.className}`}>Films</h1>
        </div>
        {films && films.length > 0 && (
          <p className="text-gray-500 text-xs tracking-widest uppercase">{films.length} {films.length === 1 ? "project" : "projects"}</p>
        )}
      </div>

      {films && films.length > 0 ? (
        /* Clean 2-column Symmetrical Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          {films.map((film, index) => (
            <Link
              href={`/project/${film.id}`}
              key={film.id}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative aspect-video w-full overflow-hidden mb-4 bg-black/5">
                <img
                  src={film.cover_image_url || "/placeholder-film.jpg"}
                  alt={film.title}
                  className="w-full h-full transform group-hover:scale-105 transition-all duration-1000 ease-out"
                  style={{ objectFit: (film.cover_fit as "cover" | "contain") || "cover" }}
                />
              </div>
              <div className="flex justify-center text-center mt-2">
                <h2 className={`text-lg md:text-xl font-bold tracking-widest uppercase text-black group-hover:opacity-60 transition-opacity duration-300 ${playfair.className}`}>
                  {film.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 md:py-32 text-center animate-fade-in-up animation-delay-200">
          <p className="text-gray-500 text-sm tracking-[0.3em] uppercase">No films published yet</p>
          <p className="text-gray-400 text-xs mt-2">Check back soon.</p>
        </div>
      )}
    </div>
  );
}
