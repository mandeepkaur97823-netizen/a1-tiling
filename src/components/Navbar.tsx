import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageSquare, ArrowUpRight } from "lucide-react";
import { business } from "../config/business";
import { A1Logo } from "./A1Logo";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Projects", href: "#projects" },
  { label: "Reviews", href: "#reviews" },
  { label: "Service Areas", href: "#service-areas" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const whatsappUrl = `https://wa.me/${business.phoneInternational.replace(/\+/g, "")}?text=${encodeURIComponent(
    "Hi A1 Tiling, I'd like to get a quote for a tiling project.",
  )}`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "bg-[#050505]/95 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-gradient-to-b from-[#050505]/80 via-[#050505]/30 to-transparent border-b border-transparent"
      }`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <a
          href="#home"
          onClick={() => setMobileOpen(false)}
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4B8CFF] shrink-0"
          aria-label={`${business.name} Home`}
        >
          <A1Logo size="md" />
        </a>

        {/* Right Side: Navigation Links & CTA pinned to the far right corner */}
        <div className="flex items-center gap-3.5 lg:gap-5 xl:gap-7 ml-auto justify-end">
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-3 xl:gap-5"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs xl:text-sm font-medium text-white/85 hover:text-white transition-colors whitespace-nowrap shrink-0 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-px after:bg-[#4B8CFF] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href="#quote"
              className="hidden sm:inline-flex items-center justify-center px-4 xl:px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase bg-white text-[#050505] hover:bg-[#4B8CFF] hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B8CFF]"
            >
              GET A FREE QUOTE
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 border border-white/20 text-white hover:border-white/50 transition-colors bg-white/5 active:bg-white/15"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#07080a]/98 backdrop-blur-xl border-t border-white/10 px-5 py-6 max-h-[calc(100svh-4.5rem)] overflow-y-auto">
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col divide-y divide-white/10"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3.5 text-base font-medium text-white/90 hover:text-[#4B8CFF] transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-white/20 text-xs font-mono">&rsaquo;</span>
              </a>
            ))}
          </nav>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3">
            <a
              href="#quote"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3.5 px-5 text-center text-xs font-bold tracking-[0.14em] uppercase bg-white text-[#050505] hover:bg-[#4B8CFF] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <span>GET A FREE QUOTE</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:${business.phoneInternational}`}
                className="py-3 px-3 inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase border border-white/20 text-white hover:border-white/50 transition-colors bg-white/5"
              >
                <Phone className="w-3.5 h-3.5 text-[#4B8CFF]" />
                <span>Call Us</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-3 inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-colors bg-emerald-500/5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
