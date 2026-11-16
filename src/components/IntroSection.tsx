import { motion, useReducedMotion } from "motion/react";
import { business } from "../config/business";
import { FallbackImage } from "./FallbackImage";

const keyValues = [
  {
    index: "01",
    title: "Over 10 Years’ Experience",
    detail:
      "More than a decade of hands-on tiling craft across diverse architectural surfaces and complex layouts.",
  },
  {
    index: "02",
    title: "High-Quality Workmanship",
    detail:
      "Sharp grout geometry, level substrates, and clean finishes designed for lasting visual presentation.",
  },
  {
    index: "03",
    title: "Residential & Commercial Projects",
    detail:
      "Tailored tiling execution for private homes, bathrooms, pools, and commercial interiors across South East Queensland.",
  },
];

export function IntroSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="about"
      className="bg-[#F3F2EF] text-[#050505] py-14 sm:py-20 lg:py-28 border-t border-black/10"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-stretch">
          {/* Left Copy Column */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col justify-between"
          >
            <div>
              <p className="font-mono text-[11px] sm:text-xs tracking-[0.2em] text-[#252525]/70 uppercase mb-2 sm:mb-4">
                About A1 Tiling Pty Ltd
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-[#050505] text-balance leading-[1.12] sm:leading-[1.08] mb-3 sm:mb-6">
                TILING THAT TRANSFORMS SPACES.
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-[#252525] leading-relaxed mb-6 sm:mb-10 max-w-xl">
                At A1 Tiling Pty Ltd, we specialise in all aspects of tiling,
                bringing experience, attention to detail and high-quality
                workmanship to residential and commercial projects.
              </p>
            </div>

            <div className="divide-y divide-black/12 border-t border-b border-black/12">
              {keyValues.map((val) => (
                <div
                  key={val.index}
                  className="py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4 items-baseline"
                >
                  <span className="sm:col-span-2 font-mono text-xs text-[#4B8CFF] font-medium tabular-nums">
                    {val.index}
                  </span>
                  <div className="sm:col-span-10">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-[#050505] mb-1">
                      {val.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#252525]/80 leading-relaxed">
                      {val.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Architectural Photograph */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col"
          >
            <div className="relative flex-1 min-h-[360px] lg:min-h-full overflow-hidden bg-[#151515]">
              <FallbackImage
                src={business.introImageUrl}
                alt="Minimalist architectural interior with seamless large-format limestone-look floor tiles"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 text-xs text-[#252525]/70">
              Architectural interior visual showcasing large-format floor tile
              alignment and mitred edge detailing.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
