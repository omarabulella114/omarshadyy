import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { InstagramIcon } from "@/components/Icons";
import { Mail, Phone } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const revalidate = 60;

export default async function Home() {
  const { data: settings } = await supabase.from("site_settings").select("*").limit(1).single();

  const heroUrl = settings?.hero_media_url || "/hero.jpeg";
  const isVideo = settings?.hero_media_type === "video" || heroUrl.endsWith(".mp4");

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-white">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {isVideo ? (
          <video src={heroUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative">
            <Image
              src={heroUrl}
              alt="Omar Shady – Director & Photographer"
              fill
              className="object-cover object-center"
              priority
              quality={100}
            />
          </div>
        )}
        {/* Cinematic Vignette - Light Mode */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-white/70 z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col justify-between h-full w-full px-6 md:px-14 py-6 md:py-10">

        {/* Top spacer — Navbar sits above */}
        <div className="h-16 md:h-20" />

        {/* Bottom section */}
        <div className="flex flex-col gap-6 md:gap-10 pb-4 md:pb-2">

          {/* Entry Links + Icons — stacked on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 sm:gap-8 animate-fade-in-up animation-delay-200">

            {/* Entry Links */}
            <div className="flex gap-8 sm:gap-14">
              <Link
                href="/films"
                className="group relative uppercase tracking-[0.3em] text-sm font-medium text-black/80 hover:text-black transition-colors duration-300 drop-shadow-[0_1px_4px_rgba(255,255,255,1)]"
              >
                Films
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-black group-hover:w-full transition-all duration-500" />
              </Link>
              <Link
                href="/creative-projects"
                className="group relative uppercase tracking-[0.3em] text-sm font-medium text-black/80 hover:text-black transition-colors duration-300 drop-shadow-[0_1px_4px_rgba(255,255,255,1)]"
              >
                Creative
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-black group-hover:w-full transition-all duration-500" />
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex gap-6 items-center">
              <a href="mailto:contact@omarshady.com" aria-label="Email"
                className="text-black/70 hover:text-black transition-all duration-300 active:scale-90 drop-shadow-[0_1px_4px_rgba(255,255,255,1)]">
                <Mail size={22} strokeWidth={2} />
              </a>
              <a href="https://www.instagram.com/omarshadyy?igsh=MW1yd3gwcWR1Y2c3eQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="text-black/70 hover:text-black transition-all duration-300 active:scale-90 drop-shadow-[0_1px_4px_rgba(255,255,255,1)]">
                <InstagramIcon size={22} />
              </a>
              <a href="tel:+1234567890" aria-label="Phone"
                className="text-black/70 hover:text-black transition-all duration-300 active:scale-90 drop-shadow-[0_1px_4px_rgba(255,255,255,1)]">
                <Phone size={22} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
