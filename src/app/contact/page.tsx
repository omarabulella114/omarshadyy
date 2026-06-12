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
    <div className="pt-28 md:pt-36 px-6 md:px-14 max-w-5xl mx-auto w-full min-h-screen pb-20 md:pb-24">

      {/* Header */}
      <div className="mb-12 md:mb-20 animate-fade-in-up">
        <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-3 md:mb-4">Get in Touch</p>
        <h1 className={`text-4xl md:text-7xl font-bold leading-tight text-black ${playfair.className}`}>
          Let's Work<br />Together
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 animate-fade-in-up animation-delay-200">

        {/* Left: Contact Info */}
        <div className="space-y-6 md:space-y-8">
          <p className="text-gray-600 font-light leading-relaxed text-base md:text-lg max-w-sm">
            Available for directing, photography, and creative collaborations worldwide.
          </p>

          <div className="space-y-4 md:space-y-5">
            <a href="mailto:contact@omarshady.com"
              className="flex items-center gap-4 group text-gray-800 hover:text-black transition-colors duration-300 active:opacity-70">
              <Mail size={18} strokeWidth={2} className="text-gray-500 group-hover:text-black transition-colors shrink-0" />
              <span className="text-sm md:text-base tracking-wide font-light border-b border-black/10 group-hover:border-black/50 pb-1 transition-colors">
                contact@omarshady.com
              </span>
            </a>
            <a href="tel:+1234567890"
              className="flex items-center gap-4 group text-gray-800 hover:text-black transition-colors duration-300 active:opacity-70">
              <Phone size={18} strokeWidth={2} className="text-gray-500 group-hover:text-black transition-colors shrink-0" />
              <span className="text-sm md:text-base tracking-wide font-light border-b border-black/10 group-hover:border-black/50 pb-1 transition-colors">
                +1 234 567 890
              </span>
            </a>
          </div>
        </div>

        {/* Right: Socials */}
        <div>
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-6 md:mb-8">Follow the Work</p>
          <div className="flex flex-col gap-5 md:gap-6">
            {[
              { href: "https://www.instagram.com/omarshadyy?igsh=MW1yd3gwcWR1Y2c3eQ==", Icon: InstagramIcon, label: "Instagram", sub: "@omarshadyy", target: "_blank" },
              { href: "#", Icon: VimeoIcon, label: "Vimeo", sub: "Portfolio & Films", target: undefined },
              { href: "#", Icon: WhatsAppIcon, label: "WhatsApp", sub: "Direct message", target: undefined },
            ].map(({ href, Icon, label, sub, target }) => (
              <a key={label} href={href} target={target} rel={target ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 md:gap-5 group active:opacity-70">
                <div className="w-10 h-10 border border-black/10 rounded-full flex items-center justify-center group-hover:border-black/50 transition-colors shrink-0 text-black">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-black text-sm font-medium tracking-wide group-hover:opacity-70 transition-opacity">{label}</p>
                  <p className="text-gray-500 text-xs tracking-wide">{sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
