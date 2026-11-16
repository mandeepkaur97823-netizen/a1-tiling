export interface ServiceDefinition {
  id: string;
  index: string;
  title: string;
  quoteValue: string;
  categoryFilter: PortfolioCategory;
  description: string;
  imageUrl: string;
  imageAlt: string;
  highlights: string[];
}

export type PortfolioCategory =
  | "All Projects"
  | "Wall & Floor"
  | "Stone"
  | "Pool"
  | "Residential"
  | "Commercial";

export interface PortfolioItem {
  id: string;
  title: string;
  category: Exclude<PortfolioCategory, "All Projects">;
  description: string;
  imageUrl: string;
  imageAlt: string;
  location?: string;
  isDemonstration: boolean;
  span?: "wide" | "standard";
  material?: string;
  scope?: string;
  standards?: string;
}

export interface InstagramGalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
}

export interface MaterialFinishOption {
  id: string;
  name: string;
  subtitle: string;
  tone: string;
  accentHex: string;
  roughness: number;
  clearcoat: number;
  veinStyle:
    | "marble"
    | "sapphire"
    | "travertine"
    | "concrete"
    | "ceramic"
    | "basalt";
  notes: string;
}

export const business = {
  name: "A1 Tiling Pty Ltd",
  shortName: "A1 Tiling",
  phoneDisplay: "0435 076 111",
  phoneInternational: "+61435076111",
  email: "a1tiling123@gmail.com",
  instagramHandle: "@a1tiling1",
  instagramUrl: "https://www.instagram.com/a1tiling1/",
  experience: "Over 10 Years",
  locations: [
    "Brisbane, Queensland",
    "Gold Coast, Queensland",
    "Sunshine Coast, Queensland",
  ],
  locationLabels: ["Brisbane", "Gold Coast", "Sunshine Coast"],
  services: [
    "Wall & Floor Tiling",
    "Stone Work (Wall & Floor)",
    "Pool Tiling",
    "Residential Tiling",
    "Commercial Tiling",
  ],
  logoUrl: "/src/assets/images/a1_logo_cropped.png" as string | null,
  hero3DAsset: null as string | null,
  heroPosterUrl: "/src/assets/images/hero_luxury_bathroom_1794729089186.jpg",
  introImageUrl: "/src/assets/images/intro_architectural_tiling_1794729090370.jpg",
  quoteBackdropUrl: "/src/assets/images/quote_architectural_backdrop_1794729092578.jpg",
  projectGallery: [] as PortfolioItem[],
  instagramGallery: [] as InstagramGalleryItem[],
  enquiryEndpoint: "/api/enquiries",
} as const;

export const serviceCatalog: ServiceDefinition[] = [
  {
    id: "wall-floor",
    index: "01",
    title: "Wall & Floor Tiling",
    quoteValue: "Wall & Floor Tiling",
    categoryFilter: "Wall & Floor",
    description:
      "Professional wall and floor tiling for interior and exterior spaces, with a focus on clean finishes and precise presentation.",
    imageUrl: "/src/assets/images/service_wall_floor_1794729089870.jpg",
    imageAlt:
      "Large-format matte stone-grey wall and floor porcelain tiling in a contemporary interior",
    highlights: [
      "Large-format porcelain & ceramic",
      "Clean mitred edges & tight joints",
      "Interior & exterior living areas",
    ],
  },
  {
    id: "stone",
    index: "02",
    title: "Stone Work (Wall & Floor)",
    quoteValue: "Stone Work (Wall & Floor)",
    categoryFilter: "Stone",
    description:
      "Specialised natural stone work for both walls and floors. From architectural stacked stone cladding and feature walls to premium honed stone flooring, paving, and stone masonry.",
    imageUrl: "/src/assets/images/service_stone_wall_floor_1794739377016.jpg",
    imageAlt:
      "Luxury natural stacked stone wall cladding seamlessly meeting large-format honed stone floor paving in an architectural residence",
    highlights: [
      "Natural stone feature walls, stacked stone & cladding",
      "Honed stone floor paving, flagstone & large slabs",
      "Complete interior & exterior wall & floor stone masonry",
    ],
  },
  {
    id: "pool",
    index: "03",
    title: "Pool Tiling",
    quoteValue: "Pool Tiling",
    categoryFilter: "Pool",
    description:
      "Pool tiling for beautifully finished outdoor environments, combining tile detail with the surrounding architecture.",
    imageUrl: "/src/assets/images/service_pool_tiling_1794729091894.jpg",
    imageAlt:
      "Luxury Queensland swimming pool with charcoal mosaic waterline tiles and limestone coping",
    highlights: [
      "Waterline mosaics & full pool interiors",
      "Coping & surrounding alfresco tiling",
      "Built for Queensland outdoor conditions",
    ],
  },
  {
    id: "residential",
    index: "04",
    title: "Residential Tiling",
    quoteValue: "Residential Project",
    categoryFilter: "Residential",
    description:
      "Tiling services for residential projects, helping create attractive and functional living spaces.",
    imageUrl: "/src/assets/images/service_residential_tiling_1794729092401.jpg",
    imageAlt:
      "Modern residential bathroom featuring marble-look floor slabs and architectural fixtures",
    highlights: [
      "Bathrooms, ensuites & wet areas",
      "Kitchens, living zones & patios",
      "New builds & home renovations",
    ],
  },
  {
    id: "commercial",
    index: "05",
    title: "Commercial Tiling",
    quoteValue: "Commercial Project",
    categoryFilter: "Commercial",
    description:
      "Tiling services for commercial projects, with professional presentation and attention to project requirements.",
    imageUrl: "/src/assets/images/service_commercial_tiling_1794729091876.jpg",
    imageAlt:
      "Contemporary commercial building foyer with expansive dark graphite porcelain floor tiles",
    highlights: [
      "Foyers, hospitality & retail spaces",
      "Consistent large-area floor alignment",
      "Reliable scheduling & clean handover",
    ],
  },
];

export const demonstrationPortfolioItems: PortfolioItem[] = [
  {
    id: "demo-master-ensuite",
    title: "Master Ensuite Walk-In Shower & Double Vanity",
    category: "Residential",
    location: "New Farm, Brisbane",
    material: "White Glazed Wall Tiles, Hexagon Mosaic Shower Base & Timber-Look Porcelain Planks",
    scope: "Frameless Glass Walk-In Shower, Soaking Tub Surround & Double Vanity Area",
    standards: "AS3740 Certified Waterproofing & 1.5mm Precision Grout Lines",
    description:
      "High-end master ensuite featuring a walk-in glass shower with large white wall tiles, black hexagon mosaic shower floor, timber-look floor tiles, and quartz double vanity.",
    imageUrl: "/src/assets/images/portfolio_master_ensuite.jpg",
    imageAlt:
      "Modern master bathroom featuring walk-in glass shower with white tiles, black hexagon shower floor, and timber-grain floor tiles",
    isDemonstration: false,
    span: "wide",
  },
  {
    id: "demo-fireplace-living",
    title: "Herringbone Mosaic Fireplace Pillar & Living Pavilion",
    category: "Wall & Floor",
    location: "Main Beach, Gold Coast",
    material: "Grey Mosaic Herringbone Tiles & Heat-Resistant Adhesive",
    scope: "Central Architectural Dual-Aspect Fireplace Pillar & Living Transition",
    standards: "Continuous Herringbone Geometry & Clean Mitred Corner Wrap",
    description:
      "Contemporary open-plan living pavilion centered on an architectural fireplace pillar clad in intricate grey herringbone mosaic tiles with floor-to-ceiling glass.",
    imageUrl: "/src/assets/images/portfolio_ocean_terrace.jpg",
    imageAlt:
      "Contemporary open-plan living room with grey herringbone tiled fireplace pillar and timber flooring",
    isDemonstration: false,
    span: "standard",
  },
  {
    id: "demo-stone-bath",
    title: "Organic Stone Freestanding Tub & Pebble Drainage Border",
    category: "Stone",
    location: "Noosa Heads, Sunshine Coast",
    material: "Natural River Pebble Border & Large-Format Honed Sandstone-Look Tiles",
    scope: "Open Indoor-Outdoor Wet Area, Freestanding Stone Tub Bed & Textured Walls",
    standards: "Concealed Perimeter Sub-Floor Drainage & Anti-Slip Honed Finish",
    description:
      "Resort-inspired indoor-outdoor bathroom with an organic freestanding stone bathtub, framed by smooth natural river pebbles and large-format floor tiles.",
    imageUrl: "/src/assets/images/portfolio_stone_tub.jpg",
    imageAlt:
      "Resort bathroom with organic stone bathtub, river pebble border drainage, and large floor tiles",
    isDemonstration: false,
    span: "standard",
  },
  {
    id: "demo-kitchen-island",
    title: "Calacatta Marble Waterfall Island & Tiled Splashback",
    category: "Residential",
    location: "Paddington, Brisbane",
    material: "Calacatta Marble Waterfall Slab & White Glazed Feature Splashback",
    scope: "Central Kitchen Island, Main Splashback Wall & Butler's Pantry",
    standards: "Seamless Mitred 45° Waterfall Edges & Stain-Resistant Grouting",
    description:
      "Architectural kitchen featuring a Calacatta marble waterfall island bench, full-height glazed tiled splashback, and warm integrated under-cabinet lighting.",
    imageUrl: "/src/assets/images/portfolio_kitchen_island.jpg",
    imageAlt:
      "Architectural kitchen with marble waterfall island bench and tiled splashback",
    isDemonstration: false,
    span: "standard",
  },
  {
    id: "demo-resort-pool",
    title: "Resort Swimming Pool & Natural Stone Retaining Enclosure",
    category: "Pool",
    location: "Noosa Hinterland, Sunshine Coast",
    material: "Turquoise Pool Lining & Handcrafted Dry-Stacked Limestone Wall",
    scope: "Full Pool Basin, Timber Surrounds & Natural Stone Courtyard Wall",
    standards: "Chemical-Resistant Pool Sealing & Precision Masonry Retaining Walls",
    description:
      "Luxury swimming pool with clear turquoise water, timber sun-decking, and a natural dry-stacked limestone retaining wall creating a secluded resort courtyard.",
    imageUrl: "/src/assets/images/portfolio_noosa_pool.jpg",
    imageAlt:
      "Luxury resort pool with turquoise water, timber decking, and dry-stacked natural limestone stone wall",
    isDemonstration: false,
    span: "standard",
  },
  {
    id: "demo-commercial-corridor",
    title: "Executive Commercial Corridor & Honed Floor Plates",
    category: "Commercial",
    location: "Eagle Street Pier, Brisbane CBD",
    material: "Commercial-Grade High-Traffic Honed Floor Surface & Expansion Trims",
    scope: "Central Office Spine, Meeting Suites & Corporate Break-Out Area",
    standards: "High Slip-Resistance Commercial Handover & Acoustic Sub-Base",
    description:
      "Contemporary corporate office interior featuring expansive honed floor plates, acoustic ceiling baffles, floor-to-ceiling glass meeting suites, and integrated kitchen.",
    imageUrl: "/src/assets/images/portfolio_commercial_corridor.jpg",
    imageAlt:
      "Commercial corporate office interior featuring large polished floor plates and glass meeting suites",
    isDemonstration: false,
    span: "wide",
  },
];

export const materialFinishes: MaterialFinishOption[] = [
  {
    id: "calacatta",
    name: "Calacatta Marble",
    subtitle: "Large-Format Polished Porcelain",
    tone: "Warm Alabaster & Soft Grey Veining",
    accentHex: "#ECEAE4",
    roughness: 0.12,
    clearcoat: 0.9,
    veinStyle: "marble",
    notes:
      "Refined bright marble appearance suited to feature shower walls, vanities, and architectural focal planes.",
  },
  {
    id: "concrete",
    name: "Concrete Look",
    subtitle: "Contemporary Matte Porcelain Look",
    tone: "Mid-Tone Urban Stone Grey",
    accentHex: "#9AA0A6",
    roughness: 0.52,
    clearcoat: 0.12,
    veinStyle: "concrete",
    notes:
      "Clean, low-sheen modern finish ideal for seamless indoor-outdoor residential and commercial floors.",
  },
  {
    id: "stone",
    name: "Stone Finish",
    subtitle: "Natural Stone Strata Aesthetic",
    tone: "Warm Sand & Organic Linear Grain",
    accentHex: "#C7B89E",
    roughness: 0.48,
    clearcoat: 0.18,
    veinStyle: "travertine",
    notes:
      "Tactile natural stone texture that softens architectural geometry with warm coastal character.",
  },
  {
    id: "carrara",
    name: "Carrara Marble",
    subtitle: "Italian White Marble Finish",
    tone: "Pure White & Delicate Smoky Veining",
    accentHex: "#F2F2F4",
    roughness: 0.14,
    clearcoat: 0.88,
    veinStyle: "ceramic",
    notes:
      "Timeless luminous Italian marble character offering classic elegance for bathroom walls and floors.",
  },
  {
    id: "dark-stone",
    name: "Dark Stone",
    subtitle: "Large-Format Dark Stone Aesthetic",
    tone: "Deep Graphite & Mineral Fleck",
    accentHex: "#2B2D31",
    roughness: 0.32,
    clearcoat: 0.28,
    veinStyle: "basalt",
    notes:
      "High-contrast architectural dark slate look that highlights crisp grout geometry and warm lighting.",
  },
];
