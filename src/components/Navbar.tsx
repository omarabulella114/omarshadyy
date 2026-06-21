"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { InstagramIcon, VimeoIcon } from "@/components/Icons";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"] });

const navLinks = [
  { title: "Home", href: "/" },
  { title: "Films", href: "/films" },
  { title: "Creative Projects", href: "/creative-projects" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 px-6 md:px-8 py-5 md:py-7 flex items-center justify-between transition-all duration-300 ${
          scrolled && pathname !== "/"
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className={`text-lg sm:text-2xl font-bold italic tracking-wide z-50 relative transition-all duration-300 ${playfair.className} ${
            pathname === "/" ? "[color:rgba(255,255,255,0.8)] hover:[color:rgba(255,255,255,1)]" : "[color:#050505] hover:opacity-70"
          }`}
          style={pathname === "/" ? { textShadow: "0 2px 8px rgba(0,0,0,1)" } : {}}
          onClick={() => setIsOpen(false)}
        >
          Omar Shady
        </Link>

        {/* Hamburger Button — larger tap target on mobile */}
        <button
          onClick={toggleMenu}
          className={`z-50 relative p-3 -mr-2 transition-all duration-300 focus:outline-none ${
            pathname === "/" ? "[color:rgba(255,255,255,0.8)] hover:[color:rgba(255,255,255,1)]" : "[color:#050505] hover:opacity-70"
          }`}
          style={pathname === "/" ? { filter: "drop-shadow(0 2px 8px rgba(0,0,0,1))" } : {}}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
        </button>
      </nav>

      {/* Sidebar Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white border-l border-black/10 z-50 flex flex-col shadow-2xl"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-10 py-8 border-b border-black/10">
                <span className={`text-xs tracking-[0.4em] text-black/30 uppercase ${playfair.className}`}>Menu</span>
                <button
                  onClick={toggleMenu}
                  className="text-black/40 hover:text-black transition-colors"
                  aria-label="Close menu"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 flex flex-col justify-center px-10">
                <ul className="flex flex-col space-y-1">
                  {navLinks.map((link, i) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.li
                        key={link.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center justify-between py-4 border-b border-black/5 transition-all duration-300 ${isActive ? "text-black" : "text-black/40 hover:text-black"}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] text-black/20 tabular-nums w-5">{String(i + 1).padStart(2, "0")}</span>
                            <span className={`text-2xl font-bold ${playfair.className}`}>{link.title}</span>
                          </div>
                          {isActive && <span className="w-2 h-2 rounded-full bg-black" />}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Bottom bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="px-10 py-8 border-t border-black/10 flex justify-between items-center"
              >
                <Link
                  href="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] tracking-[0.3em] text-black/20 hover:text-black transition-colors uppercase"
                >
                  Admin
                </Link>
                <div className="flex gap-5 items-center">
                  <a href="https://www.instagram.com/omarshadyy?igsh=MW1yd3gwcWR1Y2c3eQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-black/30 hover:text-black transition-colors">
                    <InstagramIcon size={16} />
                  </a>
                  <a href="#" aria-label="Vimeo" className="text-black/30 hover:text-black transition-colors">
                    <VimeoIcon size={16} />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
