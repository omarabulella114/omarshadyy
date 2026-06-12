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
    <div className="relative w-full h-screen overflow-hidden bg-[#050505]">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {isVideo ? (
          <video
            src={heroUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full relative">
            <Image
              src={heroUrl}
              alt="Omar Shady – Director & Photographer"
              fill
              className="object-cover"
              priority
              quality={100}
            />
          </div>
        )}

        {/* Cinematic Vignette — protects text without killing the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/70 z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col justify-between h-full w-full px-8 md:px-14 py-8 md:py-10">

        {/* Top spacer (Navbar is fixed above) */}
        <div />

        {/* Bottom section */}
        <div className="flex flex-col gap-10 pb-2">


          {/* Row: Entry links left, icons right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 animate-fade-in-up animation-delay-200">

            {/* Entry Links */}
            <div className="flex gap-10 sm:gap-14">
              <Link
                href="/films"
                className="group relative uppercase tracking-[0.3em] text-xs sm:text-sm font-light text-white/80 hover:text-white transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
              >
                Films
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-500" />
              </Link>
              <Link
                href="/creative-projects"
                className="group relative uppercase tracking-[0.3em] text-xs sm:text-sm font-light text-white/80 hover:text-white transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
              >
                Creative
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-500" />
              </Link>
            </div>

            {/* Social / Contact Icons */}
            <div className="flex gap-7 items-center">
              <a
                href="mailto:contact@omarshady.com"
                aria-label="Email"
                className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
              >
                <Mail size={22} strokeWidth={1.5} />
              </a>
              <a
                href="https://www.instagram.com/omarshadyy?igsh=MW1yd3gwcWR1Y2c3eQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
              >
                <InstagramIcon size={22} />
              </a>
              <a
                href="tel:+1234567890"
                aria-label="Phone"
                className="text-white/70 hover:text-white transition-all duration-300 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
              >
                <Phone size={22} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
