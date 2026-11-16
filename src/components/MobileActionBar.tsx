import { Phone, Layers, FileText } from "lucide-react";
import { business } from "../config/business";

export function MobileActionBar() {
  return (
    <div
      aria-label="Quick actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#050505] border-t border-white/20 grid grid-cols-3 divide-x divide-white/15"
    >
      <a
        href={`tel:${business.phoneInternational}`}
        className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-white hover:text-[#4B8CFF] transition-colors whitespace-nowrap"
      >
        <Phone className="w-3.5 h-3.5 text-[#4B8CFF]" />
        CALL
      </a>
      <a
        href="#services"
        className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-white hover:text-[#4B8CFF] transition-colors whitespace-nowrap"
      >
        <Layers className="w-3.5 h-3.5 text-[#4B8CFF]" />
        OUR SERVICES
      </a>
      <a
        href="#quote"
        className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase bg-[#4B8CFF] text-white whitespace-nowrap"
      >
        <FileText className="w-3.5 h-3.5" />
        FREE QUOTE
      </a>
    </div>
  );
}
