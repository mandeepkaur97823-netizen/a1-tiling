import { Lock } from "lucide-react";
import { business } from "../config/business";
import { A1Logo } from "./A1Logo";

interface FooterProps {
  onOpenAdmin?: () => void;
}

const footerNav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Our Projects", href: "#projects" },
  { label: "Service Areas", href: "#service-areas" },
  { label: "Contact", href: "#quote" },
];

export function Footer({ onOpenAdmin }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-white border-t border-white/15 pb-28 sm:pb-24 md:pb-12">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <A1Logo size="md" />
            <p className="text-sm text-[#B8B8B8] leading-relaxed max-w-xs">
              &ldquo;Precision in Every Tile. Excellence in Every Space.&rdquo;
            </p>
            <p className="text-xs text-[#B8B8B8]/80">
              Brisbane | Gold Coast | Sunshine Coast
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <h3 className="font-mono text-xs tracking-[0.18em] text-[#B8B8B8] uppercase mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-[#4B8CFF] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              {onOpenAdmin && (
                <li>
                  <button
                    onClick={onOpenAdmin}
                    className="text-white/70 hover:text-[#4B8CFF] transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Lock className="w-3 h-3 text-[#4B8CFF]" />
                    <span>Admin Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Services Column */}
          <div className="lg:col-span-3">
            <h3 className="font-mono text-xs tracking-[0.18em] text-[#B8B8B8] uppercase mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              {business.services.map((srv) => (
                <li key={srv}>
                  <a
                    href="#services"
                    className="text-white/80 hover:text-[#4B8CFF] transition-colors"
                  >
                    {srv}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3">
            <h3 className="font-mono text-xs tracking-[0.18em] text-[#B8B8B8] uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`tel:${business.phoneInternational}`}
                  className="text-white hover:text-[#4B8CFF] transition-colors tabular-nums"
                >
                  {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="text-white/85 hover:text-[#4B8CFF] transition-colors break-all"
                >
                  {business.email}
                </a>
              </li>
              <li>
                <a
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/85 hover:text-[#4B8CFF] transition-colors"
                >
                  {business.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#B8B8B8]">
          <div className="flex flex-wrap items-center gap-3">
            <p>
              &copy; {currentYear} {business.name}. All rights reserved.
            </p>
            {onOpenAdmin && (
              <>
                <span className="text-white/20">&middot;</span>
                <button
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-[#4B8CFF] transition-colors cursor-pointer"
                  title="A1 Admin Portal"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </button>
              </>
            )}
          </div>
          <p>Residential &amp; Commercial Tiling &middot; South East Queensland</p>
        </div>
      </div>
    </footer>
  );
}
