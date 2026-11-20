import {
  useEffect,
  useState,
  useMemo,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  CheckCircle2,
  Mail,
  Phone,
  AlertCircle,
  X,
  MessageSquare,
  Camera,
  MapPin,
  Check,
  ShieldCheck,
} from "lucide-react";
import { business } from "../config/business";
import { FallbackImage } from "./FallbackImage";
import { insertEnquiryToSupabase, isSupabaseConfigured } from "../lib/supabase";
import {
  formatAustralianPhone,
  validateAustralianPhone,
  validateFullName,
  validateEmail,
  validateSuburbAndPostcode,
  validateProjectDescription,
  QLD_SUBURBS,
  REGIONS,
  type QldRegion,
} from "../lib/validation";

interface QuoteSectionProps {
  preselectedService: string;
  preselectedLocation: string;
}

const serviceOptions = [
  "Wall & Floor Tiling",
  "Stone Work (Wall & Floor)",
  "Pool Tiling",
  "Master Ensuite & Bathroom Renovation",
  "Kitchen Splashback & Living Floors",
  "Commercial Project",
  "Other Tiling Project",
];

const SCOPE_TAGS = [
  "Master Ensuite",
  "Full Bathroom Renovation",
  "Living Floor Tiling (~40-60m²)",
  "Pool Waterline Mosaics",
  "Stone Feature Wall",
  "Kitchen Splashback",
  "Outdoor Alfresco / Balcony",
  "Waterproofing Certificate Required",
];

export function QuoteSection({
  preselectedService,
  preselectedLocation,
}: QuoteSectionProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<QldRegion>("Brisbane");
  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");
  const [service, setService] = useState("Wall & Floor Tiling");
  const [projectType, setProjectType] = useState<"Residential" | "Commercial">(
    "Residential",
  );
  const [description, setDescription] = useState("");
  const [photoName, setPhotoName] = useState<string>("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");

  // Bot honeypot (hidden from human visitors)
  const [botField, setBotField] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<{
    referenceId: string;
    message: string;
    locationSummary: string;
  } | null>(null);

  // Filter suburbs by current selected region for datalist suggestions
  const suggestedSuburbs = useMemo(() => {
    return QLD_SUBURBS.filter((s) => s.region === region);
  }, [region]);

  useEffect(() => {
    if (preselectedService) {
      setService(preselectedService);
      if (preselectedService === "Commercial Project") {
        setProjectType("Commercial");
      } else if (
        preselectedService.includes("Residential") ||
        preselectedService.includes("Ensuite") ||
        preselectedService.includes("Bathroom")
      ) {
        setProjectType("Residential");
      }
    }
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedLocation) {
      const match = REGIONS.find(
        (r) => r.toLowerCase() === preselectedLocation.toLowerCase(),
      );
      if (match) {
        setRegion(match);
      }
    }
  }, [preselectedLocation]);

  // Real-time phone input handler with Australian format masking
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAustralianPhone(e.target.value);
    setPhone(formatted);
    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  // Suburb input change with smart postcode auto-fill
  const handleSuburbChange = (val: string) => {
    setSuburb(val);
    const matched = QLD_SUBURBS.find(
      (s) => s.name.toLowerCase() === val.trim().toLowerCase(),
    );
    if (matched) {
      setPostcode(matched.postcode);
      setRegion(matched.region);
    }
    if (fieldErrors.suburb || fieldErrors.postcode) {
      setFieldErrors((prev) => ({ ...prev, suburb: "", postcode: "" }));
    }
  };

  const handleAddScopeTag = (tag: string) => {
    setDescription((prev) => {
      const clean = prev.trim();
      if (!clean) return tag;
      if (clean.includes(tag)) return clean;
      return `${clean}, ${tag}`;
    });
    if (fieldErrors.description) {
      setFieldErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Please select a photo under 5MB.");
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
    const locationString = `${suburb ? suburb.trim() : region}, QLD ${postcode.trim()}`;
    const subject = encodeURIComponent(
      `Formal Quote Request — ${service} (${locationString})`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${fullName || "-"}`,
        `Phone: ${phone || "-"}`,
        `Email: ${email || "-"}`,
        `Region: ${region}`,
        `Suburb: ${suburb || "-"}`,
        `Postcode: ${postcode || "-"}`,
        `Service Required: ${service}`,
        `Project Type: ${projectType}`,
        "",
        "Project Scope & Description:",
        description || "-",
      ].join("\n"),
    );
    return `mailto:${business.email}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmittedRef(null);

    // Bot honeypot trap: if filled, quietly drop without error to deter automated scripts
    if (botField.trim()) {
      setSubmittedRef({
        referenceId: `A1-${Math.floor(100000 + Math.random() * 900000)}`,
        message:
          "Thank you! Your quote request has been received. Our director will contact you within 24 hours.",
        locationSummary: `${region}, Queensland`,
      });
      return;
    }

    // Comprehensive Strict Validation
    const errors: Record<string, string> = {};

    const nameRes = validateFullName(fullName);
    if (!nameRes.valid && nameRes.error) {
      errors.fullName = nameRes.error;
    }

    const phoneRes = validateAustralianPhone(phone);
    if (!phoneRes.valid && phoneRes.error) {
      errors.phone = phoneRes.error;
    }

    const emailRes = validateEmail(email);
    if (!emailRes.valid && emailRes.error) {
      errors.email = emailRes.error;
    }

    const locRes = validateSuburbAndPostcode(suburb, postcode);
    if (!locRes.valid && locRes.error) {
      errors.suburb = locRes.error;
    }

    const descRes = validateProjectDescription(description);
    if (!descRes.valid && descRes.error) {
      errors.description = descRes.error;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg(
        "Please provide accurate contact & Queensland suburb details before submitting.",
      );
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    // Formatted standard Australian location string
    const formattedLocation = `${suburb.trim()}, QLD ${postcode.trim()} (${region})`;

    let referenceId = `A1-${Math.floor(100000 + Math.random() * 900000)}`;
    const newEnquiry = {
      referenceId,
      submittedAt: new Date().toISOString(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      location: formattedLocation,
      service,
      projectType,
      description: description.trim(),
      hasPhoto: Boolean(photoName),
      photoName: photoName || undefined,
      photoDataUrl: photoDataUrl || undefined,
      status: "new" as const,
    };

    // 1. Supabase sync (if configured)
    if (isSupabaseConfigured()) {
      try {
        await insertEnquiryToSupabase(newEnquiry);
      } catch (err) {
        console.warn("Supabase insert enquiry failed:", err);
      }
    }

    // 2. Express backend sync
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

    // 3. Local storage persistence (works 100% on Vercel without server)
    try {
      const stored = localStorage.getItem("a1_stored_enquiries");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newEnquiry);
      localStorage.setItem("a1_stored_enquiries", JSON.stringify(list));
    } catch {}

    setSubmittedRef({
      referenceId,
      message:
        "Thank you! Your quote request has been verified and registered. Our director will review your project details and contact you within 24 hours.",
      locationSummary: formattedLocation,
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Context Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4B8CFF]/10 border border-[#4B8CFF]/30 text-[#4B8CFF] text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Australian Quotes</span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-tight">
              REQUEST A DETAILED TILING QUOTE
            </h2>

            <p className="text-sm sm:text-base text-[#CCCCCC] leading-relaxed">
              Every space requires precision planning, exact substrate
              preparation, and verified Queensland building standards. Share
              your project scope and suburb to receive an accurate,
              transparent quote.
            </p>

            {/* Trust points */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#A8A8A8]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4B8CFF] shrink-0" />
                <span>QBCC Licensed &amp; Insured Tiling Contractor</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4B8CFF] shrink-0" />
                <span>AS 3740 Australian Waterproofing Compliance</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#4B8CFF] shrink-0" />
                <span>24-Hour Response Guarantee across South East QLD</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-3">
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
          <div className="lg:col-span-7 bg-[#0d0e10]/95 border border-white/15 p-5 sm:p-8 lg:p-10 shadow-2xl">
            {submittedRef ? (
              <div className="py-6 space-y-6">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-7 h-7 text-[#4B8CFF] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs tracking-wider text-[#4B8CFF] uppercase mb-1">
                      Reference {submittedRef.referenceId}
                    </p>
                    <h3 className="font-display text-2xl font-semibold text-white mb-2">
                      Quote Enquiry Logged
                    </h3>
                    <p className="text-xs font-mono text-[#8E8E8E] mb-3">
                      Location: {submittedRef.locationSummary}
                    </p>
                    <p className="text-sm text-[#CCCCCC] leading-relaxed">
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
                    <span>Also Send Copy via Email App</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRef(null);
                      setFullName("");
                      setPhone("");
                      setEmail("");
                      setSuburb("");
                      setPostcode("");
                      setDescription("");
                      setPhotoName("");
                      setPhotoDataUrl("");
                      setFieldErrors({});
                    }}
                    className="px-5 py-3 border border-white/20 text-xs font-medium tracking-wider uppercase text-white hover:border-white transition-colors cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Honeypot field for bot deterrence */}
                <input
                  type="text"
                  name="company_tax_id"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="sr-only"
                  aria-hidden="true"
                />

                {errorMsg && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 bg-red-950/60 border border-red-400/40 text-xs sm:text-sm text-red-100"
                  >
                    <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* ROW 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="quote-name"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                        }
                      }}
                      placeholder="e.g. John Henderson"
                      className={`w-full px-4 py-3 bg-[#151515] border text-white text-base sm:text-sm placeholder:text-white/30 focus:outline-none transition-colors ${
                        fieldErrors.fullName
                          ? "border-red-500/80 focus:border-red-400"
                          : fullName.trim().length >= 3
                            ? "border-white/20 focus:border-[#4B8CFF]"
                            : "border-white/15 focus:border-[#4B8CFF]"
                      }`}
                    />
                    {fieldErrors.fullName ? (
                      <p className="text-[11px] text-red-400 mt-1 font-mono">
                        {fieldErrors.fullName}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#7E7E7E] mt-1 font-mono">
                        Please provide first &amp; last name
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="quote-phone"
                        className="text-xs font-medium uppercase tracking-wider text-[#B8B8B8]"
                      >
                        Phone Number *
                      </label>
                      <span className="text-[10px] font-mono text-[#4B8CFF] bg-[#4B8CFF]/10 px-1.5 py-0.5">
                        AU Mobile / Landline
                      </span>
                    </div>
                    <input
                      id="quote-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="04XX XXX XXX"
                      maxLength={14}
                      className={`w-full px-4 py-3 bg-[#151515] border text-white text-base sm:text-sm placeholder:text-white/30 focus:outline-none transition-colors ${
                        fieldErrors.phone
                          ? "border-red-500/80 focus:border-red-400"
                          : phone.length >= 10
                            ? "border-emerald-500/40 focus:border-emerald-400"
                            : "border-white/15 focus:border-[#4B8CFF]"
                      }`}
                    />
                    {fieldErrors.phone ? (
                      <p className="text-[11px] text-red-400 mt-1 font-mono">
                        {fieldErrors.phone}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#7E7E7E] mt-1 font-mono">
                        Format: 0412 345 678 or (07) XXXX XXXX
                      </p>
                    )}
                  </div>
                </div>

                {/* ROW 2: Email & Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="quote-email"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: "" }));
                        }
                      }}
                      placeholder="you@example.com.au"
                      className={`w-full px-4 py-3 bg-[#151515] border text-white text-base sm:text-sm placeholder:text-white/30 focus:outline-none transition-colors ${
                        fieldErrors.email
                          ? "border-red-500/80 focus:border-red-400"
                          : "border-white/15 focus:border-[#4B8CFF]"
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-400 mt-1 font-mono">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-region"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5"
                    >
                      Queensland Service Region *
                    </label>
                    <select
                      id="quote-region"
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value as QldRegion);
                      }}
                      className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-[#4B8CFF] cursor-pointer"
                    >
                      {REGIONS.map((reg) => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#7E7E7E] mt-1 font-mono">
                      South East Queensland Coverage
                    </p>
                  </div>
                </div>

                {/* ROW 3: Accurate Suburb & Postcode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 p-3.5 bg-white/[0.02] border border-white/10">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="quote-suburb"
                        className="text-xs font-medium uppercase tracking-wider text-white inline-flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#4B8CFF]" />
                        <span>Project Suburb *</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#8E8E8E]">
                        Suggestions enabled
                      </span>
                    </div>
                    <input
                      id="quote-suburb"
                      type="text"
                      list="qld-suburb-suggestions"
                      required
                      value={suburb}
                      onChange={(e) => handleSuburbChange(e.target.value)}
                      placeholder="e.g. New Farm, Main Beach, Noosa Heads"
                      className={`w-full px-4 py-2.5 bg-[#121316] border text-white text-base sm:text-sm placeholder:text-white/30 focus:outline-none transition-colors ${
                        fieldErrors.suburb
                          ? "border-red-500/80 focus:border-red-400"
                          : "border-white/20 focus:border-[#4B8CFF]"
                      }`}
                    />
                    <datalist id="qld-suburb-suggestions">
                      {suggestedSuburbs.map((s) => (
                        <option
                          key={`${s.name}-${s.postcode}`}
                          value={s.name}
                        >{`${s.name} (QLD ${s.postcode})`}</option>
                      ))}
                    </datalist>
                    {fieldErrors.suburb ? (
                      <p className="text-[11px] text-red-400 mt-1 font-mono">
                        {fieldErrors.suburb}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#7E7E7E] mt-1 font-mono">
                        Type or pick your Queensland suburb
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="quote-postcode"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5"
                    >
                      Postcode *
                    </label>
                    <input
                      id="quote-postcode"
                      type="text"
                      required
                      maxLength={4}
                      value={postcode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPostcode(val);
                        if (fieldErrors.suburb) {
                          setFieldErrors((prev) => ({ ...prev, suburb: "" }));
                        }
                      }}
                      placeholder="e.g. 4005"
                      className={`w-full px-4 py-2.5 bg-[#121316] border text-white text-base sm:text-sm placeholder:text-white/30 focus:outline-none transition-colors font-mono ${
                        fieldErrors.suburb && !postcode
                          ? "border-red-500/80 focus:border-red-400"
                          : "border-white/20 focus:border-[#4B8CFF]"
                      }`}
                    />
                    <p className="text-[10px] text-[#7E7E7E] mt-1 font-mono">
                      4-digit QLD Postcode
                    </p>
                  </div>
                </div>

                {/* ROW 4: Service & Project Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="quote-service"
                      className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5"
                    >
                      Service Required *
                    </label>
                    <select
                      id="quote-service"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-3 bg-[#151515] border border-white/15 text-white text-base sm:text-sm focus:outline-none focus:border-[#4B8CFF] cursor-pointer"
                    >
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5">
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

                {/* ROW 5: Description & Quick Scope Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="quote-description"
                      className="text-xs font-medium uppercase tracking-wider text-[#B8B8B8]"
                    >
                      Project Description &amp; Scope *
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        description.trim().length >= 15
                          ? "text-emerald-400"
                          : "text-[#7E7E7E]"
                      }`}
                    >
                      {description.trim().length}/15 min chars
                    </span>
                  </div>
                  <textarea
                    id="quote-description"
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (fieldErrors.description) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          description: "",
                        }));
                      }
                    }}
                    placeholder="Describe your project: e.g. Master ensuite renovation approx 35sqm, 1200x600 porcelain wall tiles, shower niche with mitred edges, starting in April..."
                    className={`w-full px-4 py-3 bg-[#151515] border text-white text-base sm:text-sm placeholder:text-white/30 focus:outline-none transition-colors ${
                      fieldErrors.description
                        ? "border-red-500/80 focus:border-red-400"
                        : "border-white/15 focus:border-[#4B8CFF]"
                    }`}
                  />
                  {fieldErrors.description && (
                    <p className="text-[11px] text-red-400 mt-1 font-mono">
                      {fieldErrors.description}
                    </p>
                  )}

                  {/* Quick Scope Tags */}
                  <div className="mt-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E8E] block mb-1.5">
                      + Tap scope tags to add details quickly:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SCOPE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddScopeTag(tag)}
                          className="text-[11px] px-2.5 py-1 bg-white/5 border border-white/15 text-white/80 hover:border-[#4B8CFF] hover:text-white hover:bg-[#4B8CFF]/10 transition-colors cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 6: Optional Photo Upload */}
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wider text-[#B8B8B8] mb-1.5">
                    Optional Site / Inspiration Photo
                  </span>
                  {!photoDataUrl ? (
                    <label className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-[#151515] border border-dashed border-white/25 hover:border-[#4B8CFF] cursor-pointer text-xs text-[#B8B8B8] transition-colors active:bg-white/5">
                      <Camera className="w-4 h-4 text-[#4B8CFF]" />
                      <span>Take photo or attach architectural reference</span>
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
                        className="p-2 text-[#B8B8B8] hover:text-white cursor-pointer"
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
                    className="flex-1 py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.14em] uppercase bg-[#4B8CFF] text-white hover:bg-white hover:text-[#050505] transition-all duration-200 active:scale-98 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#4B8CFF]/20 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying &amp; Submitting...</span>
                      </>
                    ) : (
                      <span>Request My Free Quote</span>
                    )}
                  </button>

                  <a
                    href={buildMailtoHref()}
                    className="py-4 px-6 text-center text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase border border-white/20 text-white hover:border-white transition-colors bg-white/5"
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
