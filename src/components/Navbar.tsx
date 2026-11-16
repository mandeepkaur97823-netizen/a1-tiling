import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { business } from "../config/business";
import { A1Logo } from "./A1Logo";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Projects", href: "#projects" },
  { label: "Service Areas", href: "#service-areas" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
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

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled || mobileOpen
          ? "bg-[#050505]/95 border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between gap-8">
        <a
          href="#home"
          onClick={() => setMobileOpen(false)}
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4B8CFF]"
          aria-label={`${business.name} Home`}
        >
          <A1Logo size="md" />
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap shrink-0 relative py-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-px after:bg-[#4B8CFF] hover:after:w-full after:transition-all after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#quote"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase bg-white text-[#050505] hover:bg-[#4B8CFF] hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4B8CFF]"
          >
            GET A FREE QUOTE
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 border border-white/20 text-white hover:border-white/50 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#050505] border-t border-white/10 px-6 py-6">
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col divide-y divide-white/10"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3.5 text-base font-medium text-white/90 hover:text-[#4B8CFF] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3">
            <a
              href="#quote"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3.5 px-5 text-center text-xs font-semibold tracking-[0.14em] uppercase bg-white text-[#050505] hover:bg-[#4B8CFF] hover:text-white transition-colors"
            >
              GET A FREE QUOTE
            </a>
            <a
              href={`tel:${business.phoneInternational}`}
              className="w-full py-3 px-5 inline-flex items-center justify-center gap-2 text-xs font-medium tracking-[0.1em] uppercase border border-white/20 text-white hover:border-white/50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call {business.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
