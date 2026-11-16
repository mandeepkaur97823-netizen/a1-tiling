import { Phone, MessageSquare, ArrowUpRight } from "lucide-react";
import { business } from "../config/business";

export function MobileActionBar() {
  const whatsappUrl = `https://wa.me/${business.phoneInternational.replace(/\+/g, "")}?text=${encodeURIComponent(
    "Hi A1 Tiling, I would like to get a quote for a tiling project.",
  )}`;

  return (
    <div
      aria-label="Quick mobile contact actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07080a]/95 backdrop-blur-xl border-t border-white/15 shadow-[0_-8px_25px_rgba(0,0,0,0.6)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="h-14 grid grid-cols-3 divide-x divide-white/10">
        {/* Direct Call */}
        <a
          href={`tel:${business.phoneInternational}`}
          className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-white hover:text-[#4B8CFF] active:bg-white/10 transition-colors whitespace-nowrap"
        >
          <Phone className="w-3.5 h-3.5 text-[#4B8CFF]" />
          <span>CALL</span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-emerald-400 hover:text-emerald-300 active:bg-emerald-500/10 transition-colors whitespace-nowrap"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WHATSAPP</span>
        </a>

        {/* Free Quote Anchor */}
        <a
          href="#quote"
          className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase bg-[#4B8CFF] text-white hover:bg-white hover:text-[#050505] active:scale-[0.98] transition-colors whitespace-nowrap"
        >
          <span>GET QUOTE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
