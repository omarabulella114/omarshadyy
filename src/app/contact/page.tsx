import { InstagramIcon, VimeoIcon, WhatsAppIcon } from "@/components/Icons";
import { Playfair_Display } from "next/font/google";
import { Mail, Phone } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "Contact | Omar Shady",
  description: "Get in touch with Omar Shady for film, photography, and creative collaborations.",
};

export default function ContactPage() {
  return (
    <div className="pt-36 px-8 md:px-14 max-w-5xl mx-auto w-full min-h-screen pb-24">

      {/* Header */}
      <div className="mb-20 animate-fade-in-up">
        <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4">Get in Touch</p>
        <h1 className={`text-5xl md:text-7xl font-bold leading-tight ${playfair.className}`}>
          Let's Work<br />Together
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-fade-in-up animation-delay-200">

        {/* Left: Contact Info */}
        <div className="space-y-8">
          <p className="text-gray-400 font-light leading-relaxed text-lg max-w-sm">
            Available for directing, photography, and creative collaborations worldwide. Reach out and let's create something extraordinary.
          </p>

          <div className="space-y-5 pt-4">
            <a
              href="mailto:contact@omarshady.com"
              className="flex items-center gap-4 group text-gray-300 hover:text-white transition-colors duration-300"
            >
              <Mail size={18} strokeWidth={1.5} className="text-gray-500 group-hover:text-white transition-colors" />
              <span className="text-base tracking-wide font-light border-b border-white/10 group-hover:border-white/50 pb-1 transition-colors">
                contact@omarshady.com
              </span>
            </a>
            <a
              href="tel:+1234567890"
              className="flex items-center gap-4 group text-gray-300 hover:text-white transition-colors duration-300"
            >
              <Phone size={18} strokeWidth={1.5} className="text-gray-500 group-hover:text-white transition-colors" />
              <span className="text-base tracking-wide font-light border-b border-white/10 group-hover:border-white/50 pb-1 transition-colors">
                +1 234 567 890
              </span>
            </a>
          </div>
        </div>

        {/* Right: Socials */}
        <div>
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-8">Follow the Work</p>
          <div className="flex flex-col gap-6">
            <a
              href="https://www.instagram.com/omarshadyy?igsh=MW1yd3gwcWR1Y2c3eQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-5 group"
            >
              <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-white/50 transition-colors">
                <InstagramIcon size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-light tracking-wide group-hover:opacity-70 transition-opacity">Instagram</p>
                <p className="text-gray-600 text-xs tracking-wide">@omarshadyy</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-5 group">
              <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-white/50 transition-colors">
                <VimeoIcon size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-light tracking-wide group-hover:opacity-70 transition-opacity">Vimeo</p>
                <p className="text-gray-600 text-xs tracking-wide">Portfolio & Films</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-5 group">
              <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-white/50 transition-colors">
                <WhatsAppIcon size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-light tracking-wide group-hover:opacity-70 transition-opacity">WhatsApp</p>
                <p className="text-gray-600 text-xs tracking-wide">Direct message</p>
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
