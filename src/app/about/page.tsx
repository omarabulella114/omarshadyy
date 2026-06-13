import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "About | Omar Shady",
  description: "Omar Shady — filmmaker, photographer, and creative director based worldwide.",
};

export default async function AboutPage() {
  const { data: settings } = await supabase.from("site_settings").select("*").limit(1).single();
  const imageUrl = settings?.about_image_url || "/about-portrait.jpeg";
  const subtitle = settings?.about_subtitle || "Director & Photographer";
  const title = settings?.about_title || "Vision &\nPhilosophy";
  const rawText = settings?.about_text || "I am Omar Shady — a filmmaker and photographer dedicated to crafting visual stories that linger long after the final frame.\n\nMy work spans cinematic short films, commercial projects, cultural events, and experimental photography. I am drawn to subjects that exist in quiet contrast: movement and stillness, light and shadow, the ordinary and the extraordinary.\n\nEvery project begins with a single question: what do I want the audience to feel? The answer shapes everything — from location scouting to the final color grade.";
  const paragraphs = rawText.split("\n").filter((p: string) => p.trim() !== "");

  return (
    <div className="pt-28 md:pt-36 px-6 md:px-14 max-w-6xl mx-auto w-full min-h-screen pb-20 md:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 items-start">

        {/* Portrait — shorter on mobile */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden animate-fade-in-up bg-black/5">
          <Image
            src={imageUrl}
            alt="Omar Shady"
            fill
            className="object-cover object-top transition-all duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Bio */}
        <div className="animate-fade-in-up animation-delay-200 flex flex-col justify-center">

          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4 md:mb-6">{subtitle}</p>

          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 md:mb-10 text-black whitespace-pre-line ${playfair.className}`}>
            {title}
          </h1>

          <div className="space-y-4 md:space-y-6 text-gray-600 font-light leading-relaxed text-sm md:text-lg">
            {paragraphs.map((para: string, idx: number) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-black/10 flex items-center gap-8">
            <Link 
              href="/films"
              className="group relative uppercase tracking-[0.3em] text-sm font-light text-gray-500 hover:text-black transition-colors duration-300"
            >
              View Films
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-500" />
            </Link>
            
            <Link 
              href="/creative-projects"
              className="group relative uppercase tracking-[0.3em] text-sm font-light text-gray-500 hover:text-black transition-colors duration-300"
            >
              View Creative
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
