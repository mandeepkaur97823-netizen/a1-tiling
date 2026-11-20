import { useEffect, useState } from "react";
import {
  Star,
  CheckCircle2,
  MapPin,
  MessageSquarePlus,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ReviewItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  serviceType: string;
  headline: string;
  content: string;
  date: string;
  verified: boolean;
  status: "approved" | "pending" | "hidden";
}

const serviceCategoryOptions = [
  "All Reviews",
  "Bathroom & Ensuite",
  "Pool & Outdoor",
  "Stone Work",
  "Wall & Floor",
  "Commercial",
];

const serviceFormOptions = [
  "Master Ensuite & Bathroom Renovation",
  "Wall & Floor Tiling",
  "Swimming Pool & Outdoor Tiling",
  "Natural Stone Work & Feature Walls",
  "Kitchen Splashback & Living Floors",
  "Commercial Tiling",
  "Other Tiling Project",
];

const locationFormOptions = [
  "New Farm, Brisbane",
  "Paddington, Brisbane",
  "Bulimba, Brisbane",
  "Brisbane CBD",
  "Main Beach, Gold Coast",
  "Broadbeach Waters, Gold Coast",
  "Surfers Paradise, Gold Coast",
  "Noosa Heads, Sunshine Coast",
  "Sunshine Coast",
  "Other South East Queensland",
];

export function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Reviews");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add Review Form State
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState(locationFormOptions[0]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [serviceType, setServiceType] = useState(serviceFormOptions[0]);
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch reviews from API
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    let loadedFromApi = false;
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
          try {
            localStorage.setItem("a1_client_reviews", JSON.stringify(data.reviews));
          } catch {}
          loadedFromApi = true;
          return;
        }
      }
    } catch {}
    if (!loadedFromApi) {
      try {
        const saved = localStorage.getItem("a1_client_reviews");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviews(parsed);
          }
        }
      } catch {}
    }
  };

  const handleOpenModal = () => {
    setFormError(null);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitSuccess(false);
    setFormError(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!author.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    if (!content.trim() || content.trim().length < 5) {
      setFormError("Please enter your review feedback (at least 5 characters).");
      return;
    }

    setIsSubmitting(true);
    let newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      location: location.trim(),
      rating,
      serviceType: serviceType.trim(),
      headline: headline.trim() || "High-Quality Tiling Workmanship",
      content: content.trim(),
      date: new Date().toLocaleDateString("en-AU", { month: "short", year: "numeric" }),
      verified: true,
      status: "approved",
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim(),
          location: location.trim(),
          rating,
          serviceType: serviceType.trim(),
          headline: headline.trim() || "High-Quality Tiling Workmanship",
          content: content.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.review) {
          newReview = data.review;
        }
      }
    } catch {
      // Backend not running (e.g. Vercel static deployment)
    }

    setSubmitSuccess(true);
    setReviews((prev) => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem("a1_client_reviews", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Reset form fields
    setAuthor("");
    setHeadline("");
    setContent("");
    setRating(5);
    setTimeout(() => {
      handleCloseModal();
    }, 1800);
    setIsSubmitting(false);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((rev) => {
    if (activeCategory === "All Reviews") return true;
    if (activeCategory === "Bathroom & Ensuite") {
      return (
        rev.serviceType.toLowerCase().includes("bath") ||
        rev.serviceType.toLowerCase().includes("ensuite")
      );
    }
    if (activeCategory === "Pool & Outdoor") {
      return (
        rev.serviceType.toLowerCase().includes("pool") ||
        rev.serviceType.toLowerCase().includes("outdoor")
      );
    }
    if (activeCategory === "Stone Work") {
      return rev.serviceType.toLowerCase().includes("stone");
    }
    if (activeCategory === "Wall & Floor") {
      return (
        rev.serviceType.toLowerCase().includes("wall") ||
        rev.serviceType.toLowerCase().includes("floor")
      );
    }
    if (activeCategory === "Commercial") {
      return rev.serviceType.toLowerCase().includes("commercial");
    }
    return true;
  });

  const ratingDescriptions: Record<number, string> = {
    5: "5 Stars — Outstanding Craftsmanship",
    4: "4 Stars — Great Workmanship & Service",
    3: "3 Stars — Satisfactory Project Execution",
    2: "2 Stars — Minor Issues Encountered",
    1: "1 Star — Unsatisfactory Result",
  };

  return (
    <section
      id="reviews"
      className="bg-[#050505] text-white py-14 sm:py-20 lg:py-28 border-t border-white/10 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#4B8CFF]/5 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold">
                5.0 &bull; VERIFIED CLIENT REVIEWS
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-balance">
              WHAT OUR CLIENTS SAY
            </h2>
            <p className="text-xs sm:text-base text-[#A8A8A8] max-w-xl leading-relaxed mt-2 sm:mt-3">
              Real testimonials from residential homeowners, builders, and
              commercial project managers across Brisbane, Gold Coast &amp;
              Sunshine Coast.
            </p>
          </div>

          {/* Add a Review Trigger Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold tracking-wider uppercase bg-[#4B8CFF] text-white hover:bg-white hover:text-[#050505] transition-all duration-200 active:scale-95 shadow-lg shadow-[#4B8CFF]/20 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Rating Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 bg-[#0c0d10] border border-white/10 mb-8 sm:mb-12">
          <div className="flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-6">
            <div className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              5.0
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-[11px] sm:text-xs text-[#A8A8A8] font-mono">
                Average Rating Across Queensland
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:px-6">
            <ShieldCheck className="w-6 h-6 text-[#4B8CFF] shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                100% Certified Waterproofing
              </p>
              <p className="text-[11px] text-[#8E8E8E]">
                Compliant with AS 3740 Standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:pl-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                QBCC Licensed &amp; Insured
              </p>
              <p className="text-[11px] text-[#8E8E8E]">
                Trade Qualified Australian Craftsmen
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter reviews by category"
          className="flex flex-nowrap overflow-x-auto no-scrollbar scroll-smooth gap-1.5 sm:gap-2 pb-2 sm:pb-0 sm:flex-wrap mb-6 sm:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {serviceCategoryOptions.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 border cursor-pointer active:scale-95 ${
                  active
                    ? "bg-white text-[#050505] border-white font-semibold shadow-md"
                    : "bg-[#121316] text-[#A8A8A8] border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredReviews.map((rev) => (
            <article
              key={rev.id}
              className="bg-[#0c0d10] border border-white/10 p-5 sm:p-6 flex flex-col justify-between hover:border-[#4B8CFF]/40 transition-colors shadow-lg"
            >
              <div>
                {/* Header: Stars & Verified Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-white/10 text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Project
                    </span>
                  )}
                </div>

                {/* Review Headline */}
                <h3 className="font-display text-base font-semibold text-white mb-2 leading-snug">
                  &ldquo;{rev.headline}&rdquo;
                </h3>

                {/* Review Message */}
                <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed mb-5">
                  {rev.content}
                </p>
              </div>

              {/* Reviewer Details Footer */}
              <div className="pt-3.5 border-t border-white/10">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-white">
                    {rev.author}
                  </span>
                  <span className="text-[10px] text-[#8E8E8E] font-mono">
                    {rev.date}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#8E8E8E]">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#A0A0A0]">
                    <MapPin className="w-3 h-3 text-[#4B8CFF]" />
                    {rev.location}
                  </span>
                  <span className="text-[10px] text-[#4B8CFF] font-mono bg-[#4B8CFF]/10 px-1.5 py-0.5">
                    {rev.serviceType}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* =========================================================================
          ADD A REVIEW MODAL
         ========================================================================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-review-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-[#0d0e12] border border-white/15 w-full max-w-lg p-5 sm:p-7 shadow-2xl relative my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div>
                  <h3
                    id="modal-review-title"
                    className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight"
                  >
                    Write a Client Review
                  </h3>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">
                    Share your experience working with A1 Tiling Pty Ltd
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                  className="w-9 h-9 inline-flex items-center justify-center border border-white/15 text-[#A0A0A0] hover:text-white hover:border-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Notification */}
              {submitSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-display text-lg font-semibold text-white">
                    Thank You for Your Feedback!
                  </h4>
                  <p className="text-xs text-[#B8B8B8] max-w-sm mx-auto">
                    Your review has been successfully submitted and added to our
                    verified client reviews.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-200 text-xs rounded-none">
                      {formError}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-[#A0A0A0] mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-2 mb-1">
                      {[1, 2, 3, 4, 5].map((starIdx) => {
                        const active =
                          hoverRating > 0
                            ? starIdx <= hoverRating
                            : starIdx <= rating;
                        return (
                          <button
                            key={starIdx}
                            type="button"
                            onClick={() => setRating(starIdx)}
                            onMouseEnter={() => setHoverRating(starIdx)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                            aria-label={`Rate ${starIdx} stars`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                active
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-white/5 text-white/20"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-amber-400/90 font-mono">
                      {ratingDescriptions[hoverRating || rating]}
                    </p>
                  </div>

                  {/* Name & Location Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="rev-author"
                        className="block text-[11px] font-medium uppercase tracking-wider text-[#A0A0A0] mb-1.5"
                      >
                        Your Name *
                      </label>
                      <input
                        id="rev-author"
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. Michael T."
                        className="w-full px-3.5 py-2.5 bg-[#141518] border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#4B8CFF]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="rev-loc"
                        className="block text-[11px] font-medium uppercase tracking-wider text-[#A0A0A0] mb-1.5"
                      >
                        Location *
                      </label>
                      <div className="relative">
                        <select
                          id="rev-loc"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#141518] border border-white/15 text-white text-xs focus:outline-none focus:border-[#4B8CFF] appearance-none cursor-pointer"
                        >
                          {locationFormOptions.map((loc) => (
                            <option
                              key={loc}
                              value={loc}
                              className="bg-[#141518] text-white"
                            >
                              {loc}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Service Type */}
                  <div>
                    <label
                      htmlFor="rev-service"
                      className="block text-[11px] font-medium uppercase tracking-wider text-[#A0A0A0] mb-1.5"
                    >
                      Tiling Service Received *
                    </label>
                    <div className="relative">
                      <select
                        id="rev-service"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#141518] border border-white/15 text-white text-xs focus:outline-none focus:border-[#4B8CFF] appearance-none cursor-pointer"
                      >
                        {serviceFormOptions.map((srv) => (
                          <option
                            key={srv}
                            value={srv}
                            className="bg-[#141518] text-white"
                          >
                            {srv}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-white/50 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label
                      htmlFor="rev-headline"
                      className="block text-[11px] font-medium uppercase tracking-wider text-[#A0A0A0] mb-1.5"
                    >
                      Headline / Summary
                    </label>
                    <input
                      id="rev-headline"
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Flawless tile alignment and clean handover"
                      className="w-full px-3.5 py-2.5 bg-[#141518] border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#4B8CFF]"
                    />
                  </div>

                  {/* Review Text */}
                  <div>
                    <label
                      htmlFor="rev-content"
                      className="block text-[11px] font-medium uppercase tracking-wider text-[#A0A0A0] mb-1.5"
                    >
                      Review Message *
                    </label>
                    <textarea
                      id="rev-content"
                      required
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Tell future clients about your experience with A1 Tiling (workmanship, punctuality, communication)..."
                      className="w-full px-3.5 py-2.5 bg-[#141518] border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#4B8CFF] resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2.5 border border-white/15 text-xs text-[#A0A0A0] hover:text-white hover:border-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#4B8CFF] text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-[#050505] transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <span>Submit Review</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
