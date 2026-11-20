import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CheckCircle2,
  Mail,
  Phone,
  Upload,
  AlertCircle,
  X,
  MessageSquare,
  Camera,
} from "lucide-react";
import { business } from "../config/business";
import { FallbackImage } from "./FallbackImage";
import { insertEnquiryToSupabase, isSupabaseConfigured } from "../lib/supabase";

interface QuoteSectionProps {
  preselectedService: string;
  preselectedLocation: string;
}

const serviceOptions = [
  "Wall & Floor Tiling",
  "Stone Work (Wall & Floor)",
  "Pool Tiling",
  "Residential Project",
  "Commercial Project",
  "Other",
];

const locationOptions = [
  "Brisbane",
  "Gold Coast",
  "Sunshine Coast",
  "Other South East Queensland",
];

export function QuoteSection({
  preselectedService,
  preselectedLocation,
}: QuoteSectionProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("Brisbane");
  const [service, setService] = useState("Wall & Floor Tiling");
  const [projectType, setProjectType] = useState<"Residential" | "Commercial">(
    "Residential",
  );
  const [description, setDescription] = useState("");
  const [photoName, setPhotoName] = useState<string>("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<{
    referenceId: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setService(preselectedService);
      if (preselectedService === "Commercial Project") {
        setProjectType("Commercial");
      } else if (preselectedService === "Residential Project") {
        setProjectType("Residential");
      }
    }
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedLocation) {
      setLocation(preselectedLocation);
    }
  }, [preselectedLocation]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg("Please select a photo under 4MB.");
      return;
    }
    setErrorMsg(null);
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const buildMailtoHref = () => {
    const subject = encodeURIComponent(
      `Free Quote Request — ${service} (${location})`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${fullName || "-"}`,
        `Phone: ${phone || "-"}`,
        `Email: ${email || "-"}`,
        `Project Location: ${location}`,
        `Service Required: ${service}`,
        `Project Type: ${projectType}`,
        "",
        "Project Details:",
        description || "-",
      ].join("\n"),
    );
    return `mailto:${business.email}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmittedRef(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      setErrorMsg("Please enter a valid contact phone number.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg(
        "Please include brief details about your tiling project (minimum 10 characters).",
      );
      return;
    }

    setSubmitting(true);
    let referenceId = `A1-${Math.floor(100000 + Math.random() * 900000)}`;
    const newEnquiry = {
      referenceId,
      submittedAt: new Date().toISOString(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location,
      service,
      projectType,
      description: description.trim(),
      hasPhoto: Boolean(photoName),
      photoName: photoName || undefined,
      photoDataUrl: photoDataUrl || undefined,
      status: "new" as const,
    };

    // If Supabase is configured, push directly to Supabase enquiries table
    if (isSupabaseConfigured()) {
      try {
        await insertEnquiryToSupabase(newEnquiry);
      } catch (err) {
        console.warn("Supabase insert enquiry failed:", err);
      }
    }

    try {
      const res = await fetch(business.enquiryEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnquiry),
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload?.referenceId) {
          referenceId = payload.referenceId;
          newEnquiry.referenceId = payload.referenceId;
        }
      }
    } catch (err) {
      console.warn("Backend API unavailable, saving enquiry locally:", err);
    }

    // Persist to local storage so admin panel on Vercel sees the lead immediately
    try {
      const stored = localStorage.getItem("a1_stored_enquiries");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEnquiry);
      localStorage.setItem("a1_stored_enquiries", JSON.stringify(list));
    } catch {}

    setSubmittedRef({
      referenceId,
      message:
        "Thank you! Your quote request has been lodged. Our director will contact you within 24 hours.",
    });
    setSubmitting(false);
  };

  return (
    <section
      id="quote"
      className="relative bg-[#050505] text-white py-14 sm:py-20 lg:py-28 border-t border-white/10 overflow-hidden"
    >
      {/* Subtle architectural texture backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25 pointer-events-none"
      >
        <FallbackImage
          src={business.quoteBackdropUrl}
          alt="Dark fluted stone wall tile and charcoal porcelain floor texture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/70 to-[#050505]" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* Left Conversion Copy */}
          <div className="lg:col-span-5">
            <p className="font-mono text-[11px] sm:text-xs tracking-[0.2em] text-[#4B8CFF] uppercase mb-1.5 sm:mb-3">
              Free Quote Request
            </p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-balance mb-3 sm:mb-6">
              LET’S BRING YOUR NEXT PROJECT TO LIFE.
            </h2>
            <p className="text-xs sm:text-base text-[#B8B8B8] leading-relaxed mb-6 sm:mb-8">
              Planning a residential or commercial tiling project? Get in touch
              with A1 Tiling to discuss your requirements and request a free
              quote.
            </p>

            <div className="border-t border-white/15 pt-5 sm:pt-6 space-y-3 sm:space-y-4">
              <p className="text-xs font-mono tracking-[0.15em] text-[#B8B8B8] uppercase">
                Direct Enquiries
              </p>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3">
                <a
                  href={`tel:${business.phoneInternational}`}
                  className="inline-flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#151515] border border-white/15 hover:border-[#4B8CFF] transition-colors text-xs sm:text-sm font-medium active:scale-98"
                >
                  <Phone className="w-4 h-4 text-[#4B8CFF] shrink-0" />
                  <span>Call {business.phoneDisplay}</span>
                </a>
                <a
                  href={`https://wa.me/${business.phoneInternational.replace(/\+/g, "")}?text=${encodeURIComponent(
                    "Hi A1 Tiling, I would like to request a quote for a tiling project.",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 transition-colors text-xs sm:text-sm font-medium active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#151515] border border-white/15 hover:border-[#4B8CFF] transition-colors text-xs sm:text-sm font-medium active:scale-98"
                >
                  <Mail className="w-4 h-4 text-[#4B8CFF] shrink-0" />
                  <span className="truncate">{business.email}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Functional Enquiry Form */}
          <div className="lg:col-span-7 bg-[#0d0e10]/95 border border-white/15 p-5 sm:p-8 lg:p-10">
            {submittedRef ? (
              <div className="py-6 space-y-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#4B8CFF] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs tracking-wider text-[#4B8CFF] uppercase mb-1">
                      Reference {submittedRef.referenceId}
                    </p>
                    <h3 className="font-display text-2xl font-semibold text-white mb-2">
                      Quote Enquiry Logged
                    </h3>
                    <p className="text-sm text-[#B8B8B8] leading-relaxed">
                      {submittedRef.message}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/15 pt-5 flex flex-wrap gap-3">
                  <a
                    href={buildMailtoHref()}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#4B8CFF] text-white text-xs font-semibold tracking-wider uppercase hover:bg-white hover:text-[#050505] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Also Send Copy via Email App
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRef(null);
                      setDescription("");
                      setPhotoName("");
                      setPhotoDataUrl("");
                    }}
                    className="px-5 py-3 border border-white/20 text-xs font-medium tracking-wider uppercase text-white hover:border-white transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {errorMsg && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 bg-red-950/60 border border-red-400/40 text-sm text-red-100"
                  >
                    <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="quote-name"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm placeholder:text-white/35 focus:outline-none focus:border-[#4B8CFF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quote-phone"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="04XX XXX XXX"
                      className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm placeholder:text-white/35 focus:outline-none focus:border-[#4B8CFF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="quote-email"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm placeholder:text-white/35 focus:outline-none focus:border-[#4B8CFF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quote-location"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2"
                    >
                      Project Location *
                    </label>
                    <select
                      id="quote-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-[#4B8CFF]"
                    >
                      {locationOptions.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="quote-service"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2"
                    >
                      Service Required *
                    </label>
                    <select
                      id="quote-service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-[#4B8CFF]"
                    >
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2">
                      Project Type *
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Residential", "Commercial"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setProjectType(type)}
                          className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer active:scale-95 ${
                            projectType === type
                              ? "bg-white text-[#050505] border-white shadow-sm"
                              : "bg-[#151515] text-[#B8B8B8] border-white/15 hover:border-white/40"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="quote-description"
                    className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2"
                  >
                    Project Description *
                  </label>
                  <textarea
                    id="quote-description"
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share approximate area, room or outdoor scope, tile style preferences, and ideal timeframe..."
                    className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm placeholder:text-white/35 focus:outline-none focus:border-[#4B8CFF]"
                  />
                </div>

                {/* Optional Photo Upload */}
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-2">
                    Optional Site / Inspiration Photo
                  </span>
                  {!photoDataUrl ? (
                    <label className="flex items-center justify-center gap-2.5 px-4 py-4 bg-[#151515] border border-dashed border-white/25 hover:border-[#4B8CFF] cursor-pointer text-xs text-[#B8B8B8] transition-colors active:bg-white/5">
                      <Camera className="w-4 h-4 text-[#4B8CFF]" />
                      <span>Take photo or upload architectural plan</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                      <span>Attach space photo or architectural reference</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-3 p-3 bg-[#151515] border border-white/20">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={photoDataUrl}
                          alt="Attached project reference"
                          className="w-12 h-12 object-cover shrink-0"
                        />
                        <span className="text-xs text-white truncate">
                          {photoName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoName("");
                          setPhotoDataUrl("");
                        }}
                        aria-label="Remove attached photo"
                        className="p-2 text-[#B8B8B8] hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 px-6 bg-[#4B8CFF] text-white text-xs font-semibold tracking-[0.14em] uppercase hover:bg-white hover:text-[#050505] disabled:opacity-60 transition-colors whitespace-nowrap"
                  >
                    {submitting ? "Sending Request..." : "REQUEST MY FREE QUOTE"}
                  </button>

                  <a
                    href={buildMailtoHref()}
                    className="py-4 px-5 border border-white/20 text-xs font-medium tracking-[0.12em] uppercase text-center text-white hover:border-white transition-colors whitespace-nowrap"
                  >
                    Email Directly
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
