import { Phone, Mail, MessageSquare, Wrench, Lock, ArrowRight } from "lucide-react";
import { business } from "../config/business";
import { A1Logo } from "./A1Logo";

interface MaintenanceScreenProps {
  onOpenAdmin: () => void;
  maintenanceMessage?: string;
}

export function MaintenanceScreen({
  onOpenAdmin,
  maintenanceMessage,
}: MaintenanceScreenProps) {
  const currentYear = new Date().getFullYear();
  const defaultNotice =
    "Our digital showroom is currently undergoing scheduled enhancements and portfolio updates to serve you better. We will be back online shortly.";

  const whatsappUrl = `https://wa.me/${business.phoneInternational.replace(/\+/g, "")}?text=${encodeURIComponent(
    "Hi A1 Tiling team, I visited your website and would like to enquire about a tiling project.",
  )}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between selection:bg-[#4B8CFF] selection:text-white relative overflow-hidden">
      {/* Background Architectural Grid Accent */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(75, 140, 255, 0.15), transparent 60%),
                            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 px-6 lg:px-12 py-8 flex items-center justify-between border-b border-white/10">
        <A1Logo size="sm" />
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Scheduled Maintenance
        </span>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center my-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/15 text-[#4B8CFF] mb-8 shadow-inner">
          <Wrench className="w-8 h-8 animate-pulse" />
        </div>

        <p className="font-mono text-xs text-[#4B8CFF] tracking-[0.25em] uppercase mb-4">
          PRECISION CRAFT IN PROGRESS
        </p>

        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Enhancing Our Digital Showroom
        </h1>

        <p className="text-base sm:text-lg text-[#B8B8B8] max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          {maintenanceMessage || defaultNotice}
        </p>

        {/* Immediate Contact Banner for Clients */}
        <div className="bg-[#121316] border border-white/15 p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl mb-10 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#B8B8B8]">
              Emergency &amp; Project Enquiries Are Still Open
            </h2>
          </div>
          <p className="text-sm text-white/90 mb-6">
            Need an immediate quote or have an active project in progress? Our
            head tiler and project team are directly reachable via Phone and
            WhatsApp:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Call Button */}
            <a
              href={`tel:${business.phoneInternational}`}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-white text-[#050505] font-semibold text-xs uppercase tracking-wider hover:bg-[#4B8CFF] hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call {business.phoneDisplay}</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold text-xs uppercase tracking-wider hover:bg-emerald-500/25 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-[#B8B8B8]/80 gap-2 font-mono">
            <span>Direct Email:</span>
            <a
              href={`mailto:${business.email}`}
              className="text-[#4B8CFF] hover:underline break-all"
            >
              {business.email}
            </a>
          </div>
        </div>

        {/* Regions Served Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-[#B8B8B8]/70 font-mono">
          <span>Brisbane</span>
          <span>&middot;</span>
          <span>Gold Coast</span>
          <span>&middot;</span>
          <span>Sunshine Coast</span>
          <span>&middot;</span>
          <span>Residential &amp; Commercial</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B8B8B8]">
        <p>
          &copy; {currentYear} {business.name}. All rights reserved.
        </p>

        {/* Staff & Admin Access Portal */}
        <button
          type="button"
          onClick={onOpenAdmin}
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-[#4B8CFF] transition-colors font-mono cursor-pointer"
          title="Owner / Admin Portal Access"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Staff &amp; Admin Portal</span>
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      </footer>
    </div>
  );
}
