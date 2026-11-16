import { Clock, Compass, Building2, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: Clock,
    title: "OVER 10 YEARS’ EXPERIENCE",
    description:
      "Over a decade of hands-on tiling experience across residential and commercial projects throughout South East Queensland.",
  },
  {
    icon: Compass,
    title: "HIGH-QUALITY WORKMANSHIP",
    description:
      "Focused on crisp layout alignment, clean finishes, and attentive detail on every wall, floor, stone and pool surface.",
  },
  {
    icon: Building2,
    title: "RESIDENTIAL & COMMERCIAL",
    description:
      "Equipped for private home renovations, luxury bathrooms and pools alongside commercial tiling scopes.",
  },
  {
    icon: ShieldCheck,
    title: "RELIABLE & PROFESSIONAL",
    description:
      "Clear communication, dependable scheduling, and tidy architectural presentation from initial free quote through completion.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="bg-[#050505] text-white py-20 lg:py-28 border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-14">
          <p className="font-mono text-xs tracking-[0.2em] text-[#4B8CFF] uppercase mb-3">
            Why Choose A1 Tiling
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            EXPERIENCE YOU CAN SEE IN EVERY DETAIL.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/15 border border-white/15">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-[#0b0c0e] p-8 flex flex-col justify-between gap-8"
              >
                <Icon
                  className="w-7 h-7 text-[#4B8CFF]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-wide text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#B8B8B8] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
