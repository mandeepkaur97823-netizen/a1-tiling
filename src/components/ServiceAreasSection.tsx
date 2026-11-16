import { ArrowUpRight, MapPin } from "lucide-react";

interface ServiceAreasSectionProps {
  onSelectLocation: (locationName: string) => void;
}

const regions = [
  {
    name: "Sunshine Coast",
    state: "Queensland",
    summary:
      "Coastal residences, outdoor entertaining, pool tiling and natural stone finishes.",
    coords: { cx: 196, cy: 78 },
  },
  {
    name: "Brisbane",
    state: "Queensland",
    summary:
      "Residential renovations, architectural bathrooms, wall & floor tiling and commercial interiors.",
    coords: { cx: 184, cy: 174 },
  },
  {
    name: "Gold Coast",
    state: "Queensland",
    summary:
      "Luxury homes, apartment interiors, swimming pools and large-format stone installations.",
    coords: { cx: 212, cy: 256 },
  },
];

export function ServiceAreasSection({
  onSelectLocation,
}: ServiceAreasSectionProps) {
  return (
    <section
      id="service-areas"
      className="bg-[#151515] text-white py-20 lg:py-28 border-t border-white/10"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Region Info */}
          <div className="lg:col-span-7">
            <p className="font-mono text-xs tracking-[0.2em] text-[#4B8CFF] uppercase mb-3">
              Service Coverage
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance mb-6">
              SERVICING SOUTH EAST QUEENSLAND
            </h2>
            <p className="text-base text-[#B8B8B8] leading-relaxed mb-10 max-w-xl">
              A1 Tiling Pty Ltd delivers residential and commercial tiling across
              Brisbane, the Gold Coast, and the Sunshine Coast.
            </p>

            <div className="divide-y divide-white/15 border-t border-b border-white/15 mb-9">
              {regions.map((region) => (
                <div
                  key={region.name}
                  className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <MapPin
                        className="w-4 h-4 text-[#4B8CFF] shrink-0"
                        strokeWidth={1.75}
                      />
                      <h3 className="font-display text-xl font-semibold text-white">
                        {region.name}
                      </h3>
                      <span className="text-xs text-[#B8B8B8]">
                        &middot; {region.state}
                      </span>
                    </div>
                    <p className="text-sm text-[#B8B8B8] pl-6">
                      {region.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectLocation(region.name)}
                    className="self-start sm:self-center px-4 py-2 text-xs font-medium tracking-wider uppercase border border-white/20 text-white hover:bg-white hover:text-[#050505] transition-colors whitespace-nowrap shrink-0"
                  >
                    Select Area
                  </button>
                </div>
              ))}
            </div>

            <a
              href="#quote"
              className="inline-flex items-center gap-2 px-7 py-4 text-xs font-semibold tracking-[0.14em] uppercase bg-[#4B8CFF] text-white hover:bg-white hover:text-[#050505] transition-colors whitespace-nowrap"
            >
              ENQUIRE ABOUT YOUR PROJECT
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right Architectural Coastal Schematic Graphic */}
          <div className="lg:col-span-5">
            <div className="bg-[#0b0c0e] border border-white/15 p-6 sm:p-8">
              <div className="flex items-center justify-between text-xs font-mono text-[#B8B8B8] pb-4 mb-4 border-b border-white/10">
                <span>SOUTH EAST QUEENSLAND</span>
                <span>CORRIDOR</span>
              </div>

              <svg
                viewBox="0 0 320 340"
                className="w-full h-auto"
                role="img"
                aria-label="Stylised South East Queensland corridor highlighting Sunshine Coast, Brisbane, and Gold Coast"
              >
                {/* Architectural Grid Lines */}
                <defs>
                  <pattern
                    id="seq-grid"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 32 0 L 0 0 0 32"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="320" height="340" fill="url(#seq-grid)" />

                {/* Stylised Queensland Coastline */}
                <path
                  d="M 192 16 C 198 54, 212 88, 204 126 C 198 152, 188 168, 198 194 C 208 220, 224 252, 228 296 L 236 330 L 320 330 L 320 0 L 188 0 Z"
                  fill="rgba(75, 140, 255, 0.06)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.2"
                />

                {/* Coastal Corridor Connector */}
                <path
                  d="M 196 78 L 184 174 L 212 256"
                  fill="none"
                  stroke="#4B8CFF"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                />

                {/* Region Nodes */}
                {regions.map((r) => (
                  <g
                    key={r.name}
                    className="cursor-pointer"
                    onClick={() => onSelectLocation(r.name)}
                  >
                    <circle
                      cx={r.coords.cx}
                      cy={r.coords.cy}
                      r="14"
                      fill="rgba(75, 140, 255, 0.14)"
                      stroke="#4B8CFF"
                      strokeWidth="1"
                    />
                    <circle
                      cx={r.coords.cx}
                      cy={r.coords.cy}
                      r="4.5"
                      fill="#FFFFFF"
                    />
                    <text
                      x={r.coords.cx - 18}
                      y={r.coords.cy + 4}
                      textAnchor="end"
                      fill="#FFFFFF"
                      fontSize="12"
                      fontFamily="Outfit, sans-serif"
                      fontWeight="600"
                    >
                      {r.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
