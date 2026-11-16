import { useEffect, useMemo, useState } from "react";
import {
  Expand,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowUpRight,
  Layers,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import {
  business,
  demonstrationPortfolioItems,
  type PortfolioCategory,
  type PortfolioItem,
} from "../config/business";
import { FallbackImage } from "./FallbackImage";

const categories: PortfolioCategory[] = [
  "All Projects",
  "Wall & Floor",
  "Stone",
  "Pool",
  "Residential",
  "Commercial",
];

interface PortfolioSectionProps {
  onEnquireProject?: (serviceOrProject: string) => void;
}

export function PortfolioSection({ onEnquireProject }: PortfolioSectionProps) {
  const [activeCategory, setActiveCategory] =
    useState<PortfolioCategory>("All Projects");
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const sourceItems =
    business.projectGallery.length > 0
      ? business.projectGallery
      : demonstrationPortfolioItems;

  const filteredItems = useMemo(() => {
    if (activeCategory === "All Projects") return sourceItems;
    return sourceItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, sourceItems]);

  const currentIndex = lightboxItem
    ? filteredItems.findIndex((item) => item.id === lightboxItem.id)
    : -1;

  const showPrev = () => {
    if (currentIndex < 0 || filteredItems.length === 0) return;
    const prevIdx =
      (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setLightboxItem(filteredItems[prevIdx]);
  };

  const showNext = () => {
    if (currentIndex < 0 || filteredItems.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredItems.length;
    setLightboxItem(filteredItems[nextIdx]);
  };

  useEffect(() => {
    if (!lightboxItem) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const scrollToQuote = (serviceName?: string) => {
    if (onEnquireProject && serviceName) {
      onEnquireProject(serviceName);
    } else {
      const el = document.getElementById("quote");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setLightboxItem(null);
  };

  return (
    <section
      id="projects"
      className="bg-[#0b0c0e] text-white py-20 lg:py-28 border-t border-white/10"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-[#4B8CFF] uppercase mb-3">
              Portfolio &amp; Project Showcase
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              CRAFTED SPACES. LASTING IMPRESSIONS.
            </h2>
          </div>
          <p className="text-base text-[#B8B8B8] max-w-md leading-relaxed">
            Real Queensland projects, custom natural stone masonry, and
            architectural large-format tiling with precision at every joint.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter projects by tiling category"
          className="flex flex-nowrap overflow-x-auto no-scrollbar scroll-smooth gap-2 pb-2 sm:pb-0 sm:flex-wrap mb-8 sm:mb-10 -mx-6 px-6 sm:mx-0 sm:px-0"
        >
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2.5 text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 border cursor-pointer active:scale-95 ${
                  active
                    ? "bg-white text-[#050505] border-white font-semibold shadow-md"
                    : "bg-[#151619] text-[#B8B8B8] border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Clean Project Grid (Single Presentation - Zero Duplication!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col bg-[#121316] border border-white/10 overflow-hidden hover:border-[#4B8CFF]/50 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              {/* Image Viewport with Hover Zoom and Inspect Trigger */}
              <button
                type="button"
                onClick={() => setLightboxItem(item)}
                className="relative aspect-[16/10] w-full overflow-hidden bg-black text-left focus-visible:outline-2 focus-visible:outline-[#4B8CFF]"
                aria-label={`Open full-screen inspection of ${item.title}`}
              >
                <FallbackImage
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-50 transition-opacity" />

                {/* Inspect Overlay Badge */}
                <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#050505]/90 border border-white/20 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-xl backdrop-blur-sm">
                    <Expand className="w-3.5 h-3.5 text-[#4B8CFF]" />
                    Inspect High-Res
                  </span>
                </div>

                {/* Location Chip */}
                {item.location && (
                  <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-sm border border-white/15 text-[11px] text-white/90 font-mono">
                      <MapPin className="w-3 h-3 text-[#4B8CFF]" />
                      {item.location}
                    </span>
                  </div>
                )}
              </button>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#B8B8B8] mb-2.5">
                    <span className="font-mono text-[#4B8CFF] uppercase tracking-wider text-[11px] font-medium">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#B8B8B8]/70">
                      Queensland
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-white mb-2 group-hover:text-[#4B8CFF] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#B8B8B8] leading-relaxed line-clamp-3 mb-4">
                    {item.description}
                  </p>

                  {/* Micro Specs Tags */}
                  {item.material && (
                    <div className="pt-3 border-t border-white/10 text-[11px] text-[#B8B8B8] flex items-start gap-1.5 line-clamp-1">
                      <span className="text-[#4B8CFF] font-mono">Tile:</span>
                      <span className="text-white/80 truncate">
                        {item.material}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setLightboxItem(item)}
                    className="text-xs text-white/80 hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5 text-[#4B8CFF]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToQuote(item.category)}
                    className="text-xs text-[#4B8CFF] hover:underline font-mono inline-flex items-center gap-1"
                  >
                    Request Quote &rarr;
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN PROJECT LIGHTBOX & DETAILS MODAL
         ========================================================================= */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          className="fixed inset-0 z-50 bg-[#050505]/98 text-white flex flex-col justify-between p-4 sm:p-8 backdrop-blur-md overflow-y-auto"
        >
          <div className="flex items-center justify-between gap-4 shrink-0 pb-3">
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="px-2.5 py-1 bg-[#4B8CFF]/20 border border-[#4B8CFF]/40 text-[#4B8CFF] font-mono text-xs uppercase font-medium">
                {lightboxItem.category}
              </span>
              {lightboxItem.location && (
                <span className="text-white/80 flex items-center gap-1 font-mono text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#4B8CFF]" />
                  {lightboxItem.location}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              aria-label="Close image viewer"
              className="w-10 h-10 sm:w-11 sm:h-11 inline-flex items-center justify-center border border-white/20 text-white hover:border-white transition-colors bg-white/5 active:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-3 sm:my-4 overflow-hidden min-h-[220px]">
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.imageAlt}
              referrerPolicy="no-referrer"
              className="max-h-[42vh] sm:max-h-[60vh] max-w-full object-contain border border-white/10 shadow-2xl"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6 border-t border-white/15 pt-4 shrink-0">
            <div className="max-w-3xl">
              <h3 className="font-display text-lg sm:text-2xl font-semibold text-white mb-1.5 leading-snug">
                {lightboxItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#B8B8B8] leading-relaxed mb-3">
                {lightboxItem.description}
              </p>

              {/* Lightbox Technical Details Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-white/80">
                {lightboxItem.material && (
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#4B8CFF] shrink-0" />
                    <strong className="text-white">Material:</strong> {lightboxItem.material}
                  </span>
                )}
                {lightboxItem.scope && (
                  <span className="inline-flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#4B8CFF] shrink-0" />
                    <strong className="text-white">Scope:</strong> {lightboxItem.scope}
                  </span>
                )}
                {lightboxItem.standards && (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4B8CFF] shrink-0" />
                    <strong className="text-white">Standards:</strong> {lightboxItem.standards}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => scrollToQuote(lightboxItem.category)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#050505] text-xs font-semibold tracking-wider uppercase hover:bg-[#4B8CFF] hover:text-white transition-colors cursor-pointer active:scale-95 text-center"
              >
                <span>Enquire For This Finish</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous project"
                  className="flex-1 sm:flex-initial h-10 sm:w-10 px-4 sm:px-0 border border-white/20 inline-flex items-center justify-center text-xs font-medium hover:border-white transition-colors bg-white/5 active:bg-white/15 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 sm:mr-0" />
                  <span className="sm:hidden text-xs">Prev</span>
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next project"
                  className="flex-1 sm:flex-initial h-10 sm:w-10 px-4 sm:px-0 border border-white/20 inline-flex items-center justify-center text-xs font-medium hover:border-white transition-colors bg-white/5 active:bg-white/15 cursor-pointer"
                >
                  <span className="sm:hidden text-xs">Next</span>
                  <ChevronRight className="w-4 h-4 ml-1 sm:ml-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
