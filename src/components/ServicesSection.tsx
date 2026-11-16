import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { serviceCatalog } from "../config/business";
import { FallbackImage } from "./FallbackImage";

interface ServicesSectionProps {
  onEnquireService: (quoteService: string) => void;
}

export function ServicesSection({ onEnquireService }: ServicesSectionProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="services"
      className="bg-[#050505] text-white py-14 sm:py-20 lg:py-28 border-t border-white/10"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-6 mb-8 sm:mb-14 pb-5 sm:pb-8 border-b border-white/15">
          <div>
            <p className="font-mono text-[11px] sm:text-xs tracking-[0.2em] text-[#4B8CFF] uppercase mb-1.5 sm:mb-3">
              All Aspects of Tiling
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-balance">
              OUR TILING SERVICES
            </h2>
          </div>
          <p className="text-xs sm:text-base text-[#B8B8B8] max-w-md leading-relaxed">
            Professional tiling solutions for residential and commercial spaces.
          </p>
        </div>

        <div className="divide-y divide-white/15">
          {serviceCatalog.map((service, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <motion.article
                key={service.id}
                initial={prefersReduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="py-8 sm:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-stretch"
              >
                <div
                  className={`lg:col-span-7 overflow-hidden bg-[#151515] group ${
                    isEven ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="aspect-[16/10] sm:aspect-[4/3] w-full h-full overflow-hidden">
                    <FallbackImage
                      src={service.imageUrl}
                      alt={service.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div
                  className={`lg:col-span-5 flex flex-col justify-between py-1 sm:py-2 ${
                    isEven ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-5">
                      <span className="font-mono text-[11px] sm:text-xs tracking-[0.18em] text-[#4B8CFF] tabular-nums">
                        SERVICE {service.index}
                      </span>
                      <span className="h-px flex-1 bg-white/15" />
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-2 sm:mb-4">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-base text-[#CCCCCC] leading-relaxed mb-4 sm:mb-7">
                      {service.description}
                    </p>

                    <ul className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-8 border-t border-white/10 pt-4 sm:pt-5">
                      {service.highlights.map((item) => (
                        <li
                          key={item}
                          className="text-xs sm:text-sm text-white/85 flex items-baseline gap-2.5 sm:gap-3"
                        >
                          <span
                            className="text-[#4B8CFF] font-mono text-xs"
                            aria-hidden="true"
                          >
                            &mdash;
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => onEnquireService(service.quoteValue)}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 text-[11px] sm:text-xs font-semibold tracking-[0.1em] sm:tracking-[0.14em] uppercase bg-white text-[#050505] hover:bg-[#4B8CFF] hover:text-white transition-colors whitespace-nowrap active:scale-95 cursor-pointer text-center"
                    >
                      <span>Enquire Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <span className="text-[10px] sm:text-xs text-[#B8B8B8]/70 text-right">
                      Architectural service visual
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
