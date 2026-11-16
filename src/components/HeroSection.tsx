import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { HeroBathroom3D } from "./HeroBathroom3D";

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  const fadeProps = (delay: number) =>
    prefersReduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.65,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-center bg-[#050505] text-white pt-24 pb-20 overflow-hidden"
    >
      <HeroBathroom3D />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="max-w-3xl">
          <motion.p
            {...fadeProps(0.05)}
            className="font-mono text-xs sm:text-[13px] tracking-[0.2em] text-[#B8B8B8] uppercase mb-5"
          >
            A1 TILING PTY LTD &nbsp;|&nbsp; QUEENSLAND, AUSTRALIA
          </motion.p>

          <motion.h1
            {...fadeProps(0.12)}
            className="font-display font-semibold tracking-tight text-white text-balance leading-[1.05] text-[clamp(2.35rem,4.8vw,4.35rem)] mb-6"
          >
            Precision in Every Tile. Excellence in Every Space.
          </motion.h1>

          <motion.p
            {...fadeProps(0.2)}
            className="text-base sm:text-lg text-[#E5E5E5] max-w-2xl leading-relaxed mb-8"
          >
            From elegant interiors to outdoor spaces, A1 Tiling delivers
            professional wall, floor, stone and pool tiling for residential and
            commercial projects.
          </motion.p>

          <motion.div
            {...fadeProps(0.26)}
            className="inline-flex items-center gap-4 pb-6 mb-7 border-b border-white/20"
          >
            <span className="font-mono text-xs sm:text-sm tracking-[0.18em] text-white font-medium tabular-nums">
              10+ YEARS OF EXPERIENCE
            </span>
            <span className="text-white/30" aria-hidden="true">
              /
            </span>
            <span className="text-xs sm:text-sm text-[#B8B8B8]">
              Residential &amp; Commercial
            </span>
          </motion.div>

          <motion.div
            {...fadeProps(0.32)}
            className="flex flex-wrap items-center gap-4 mb-8"
          >
            <a
              href="#quote"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase bg-[#4B8CFF] text-white hover:bg-white hover:text-[#050505] transition-colors whitespace-nowrap"
            >
              GET A FREE QUOTE
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="#projects"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase border border-white/35 bg-[#050505]/65 text-white hover:border-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              EXPLORE OUR WORK
            </a>
          </motion.div>

          <motion.p
            {...fadeProps(0.38)}
            className="font-mono text-xs tracking-[0.22em] text-[#B8B8B8] uppercase"
          >
            BRISBANE &middot; GOLD COAST &middot; SUNSHINE COAST
          </motion.p>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <a
        href="#about"
        aria-label="Scroll to introduction"
        className="hidden sm:inline-flex items-center gap-2.5 absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs tracking-[0.18em] uppercase text-white/70 hover:text-white transition-colors"
      >
        <span>Scroll</span>
        <ArrowDown className="w-3.5 h-3.5" />
      </a>
    </section>
  );
}
