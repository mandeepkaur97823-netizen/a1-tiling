import { Phone, Mail, Instagram, ArrowUpRight } from "lucide-react";
import { business } from "../config/business";
import { A1Logo } from "./A1Logo";
import { FallbackImage } from "./FallbackImage";

export function ContactInstagramSection() {
  const hasApprovedInstagramPhotos = business.instagramGallery.length > 0;

  return (
    <section
      id="contact"
      className="bg-[#151515] text-white py-20 lg:py-28 border-t border-white/10"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 space-y-20">
        {/* Instagram Showcase */}
        <div className="bg-[#0b0c0e] border border-white/15 p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="font-mono text-xs tracking-[0.2em] text-[#4B8CFF] uppercase mb-3">
                Instagram Showcase
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
                FOLLOW OUR WORK ON INSTAGRAM
              </h2>
              <p className="text-sm sm:text-base text-[#B8B8B8] leading-relaxed mb-6">
                Connect with{" "}
                <span className="text-white font-medium">
                  {business.instagramHandle}
                </span>{" "}
                for ongoing residential and commercial tiling updates across
                Brisbane, the Gold Coast, and the Sunshine Coast.
              </p>
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#050505] hover:bg-[#4B8CFF] hover:text-white text-xs font-semibold tracking-[0.14em] uppercase transition-colors whitespace-nowrap"
              >
                <Instagram className="w-4 h-4" />
                FOLLOW A1 TILING
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            {hasApprovedInstagramPhotos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:w-[460px] shrink-0">
                {business.instagramGallery.map((post) => (
                  <a
                    key={post.id}
                    href={business.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square overflow-hidden bg-[#151515] border border-white/10 group"
                  >
                    <FallbackImage
                      src={post.imageUrl}
                      alt={post.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lg:w-[420px] shrink-0 bg-[#151515] border border-white/15 hover:border-[#4B8CFF] p-6 sm:p-7 transition-colors block"
              >
                <div className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-white/10">
                  <A1Logo size="md" showText={false} />
                  <span className="font-mono text-xs text-[#4B8CFF]">
                    {business.instagramHandle}
                  </span>
                </div>
                <p className="font-display text-lg font-semibold text-white mb-2">
                  {business.name}
                </p>
                <p className="text-xs text-[#B8B8B8] leading-relaxed mb-4">
                  Tiling Services &middot; Over 10 Years&rsquo; Experience &middot;
                  Residential &amp; Commercial &middot; Free Quotes
                </p>
                <p className="text-xs font-medium text-white inline-flex items-center gap-1.5">
                  Open {business.instagramHandle} on Instagram
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#4B8CFF]" />
                </p>
              </a>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs tracking-[0.2em] text-[#4B8CFF] uppercase mb-3">
              Contact
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance mb-4">
              LET’S TALK TILING.
            </h2>
            <p className="text-base text-[#B8B8B8] leading-relaxed">
              Speak directly with {business.name} about wall, floor, stone, pool,
              residential or commercial tiling across South East Queensland.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/15 border border-white/15">
            <div className="bg-[#0b0c0e] p-7">
              <p className="font-mono text-xs text-[#B8B8B8] uppercase mb-2">
                Phone
              </p>
              <a
                href={`tel:${business.phoneInternational}`}
                className="font-display text-xl font-semibold text-white hover:text-[#4B8CFF] transition-colors tabular-nums"
              >
                {business.phoneDisplay}
              </a>
              <div className="mt-5">
                <a
                  href={`tel:${business.phoneInternational}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#050505] hover:bg-[#4B8CFF] hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Now
                </a>
              </div>
            </div>

            <div className="bg-[#0b0c0e] p-7">
              <p className="font-mono text-xs text-[#B8B8B8] uppercase mb-2">
                Email
              </p>
              <a
                href={`mailto:${business.email}`}
                className="font-display text-lg font-semibold text-white hover:text-[#4B8CFF] transition-colors break-all"
              >
                {business.email}
              </a>
              <div className="mt-5">
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/25 text-white hover:border-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Us
                </a>
              </div>
            </div>

            <div className="bg-[#0b0c0e] p-7">
              <p className="font-mono text-xs text-[#B8B8B8] uppercase mb-2">
                Instagram
              </p>
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl font-semibold text-white hover:text-[#4B8CFF] transition-colors"
              >
                {business.instagramHandle}
              </a>
              <div className="mt-5">
                <a
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/25 text-white hover:border-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  Follow on Instagram
                </a>
              </div>
            </div>

            <div className="bg-[#0b0c0e] p-7">
              <p className="font-mono text-xs text-[#B8B8B8] uppercase mb-2">
                Service Areas
              </p>
              <p className="font-display text-lg font-semibold text-white">
                Brisbane | Gold Coast | Sunshine Coast
              </p>
              <p className="text-xs text-[#B8B8B8] mt-3">
                Queensland, Australia
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
