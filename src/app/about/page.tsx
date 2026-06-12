import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "About | Omar Shady",
  description: "Omar Shady — filmmaker, photographer, and creative director based worldwide.",
};

export default function AboutPage() {
  return (
    <div className="pt-28 md:pt-36 px-6 md:px-14 max-w-6xl mx-auto w-full min-h-screen pb-20 md:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 items-start">

        {/* Portrait — shorter on mobile */}
        <div className="relative aspect-[4/5] md:aspect-[3/4] w-full overflow-hidden animate-fade-in-up bg-white/5">
          <Image
            src="/about-portrait.jpeg"
            alt="Omar Shady"
            fill
            className="object-cover object-top transition-all duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Bio */}
        <div className="animate-fade-in-up animation-delay-200 flex flex-col justify-center">

          <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4 md:mb-6">Director & Photographer</p>

          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 md:mb-10 ${playfair.className}`}>
            Vision &<br />Philosophy
          </h1>

          <div className="space-y-4 md:space-y-6 text-gray-400 font-light leading-relaxed text-sm md:text-lg">
            <p>
              I am Omar Shady — a filmmaker and photographer dedicated to crafting visual stories that linger long after the final frame.
            </p>
            <p>
              My work spans cinematic short films, commercial projects, cultural events, and experimental photography. I am drawn to subjects that exist in quiet contrast: movement and stillness, light and shadow, the ordinary and the extraordinary.
            </p>
            <p>
              Every project begins with a single question: <em className="text-white">what do I want the audience to feel?</em> The answer shapes everything — from location scouting to the final color grade.
            </p>
          </div>

          <div className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-white/10 grid grid-cols-3 gap-4 md:gap-8 text-center">
            {[
              { label: "Films", value: "—" },
              { label: "Projects", value: "—" },
              { label: "Years", value: "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className={`text-2xl md:text-4xl font-bold text-white ${playfair.className}`}>{value}</p>
                <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mt-1 md:mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
