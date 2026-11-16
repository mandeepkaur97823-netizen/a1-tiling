import { business } from "../config/business";

interface A1LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function A1Logo({
  size = "md",
  showText = true,
  className = "",
}: A1LogoProps) {
  const emblemSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  if (business.logoUrl) {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
        <div
          className={`${emblemSizes[size]} bg-[#050505] border border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm`}
        >
          <img
            src={business.logoUrl}
            alt={business.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
        {showText && (
          <span className="font-display text-xs sm:text-sm md:text-base font-semibold tracking-[0.12em] sm:tracking-[0.14em] text-white whitespace-nowrap uppercase">
            {business.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      <div
        className={`${emblemSizes[size]} bg-[#050505] border border-white/20 flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          className="w-4/5 h-4/5 text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeOpacity="0.35"
          />
          <path
            d="M10 35L19.5 13H23.2L32.7 35H28.4L26.2 29.6H16.5L14.3 35H10ZM17.8 26.2H24.9L21.35 17.4L17.8 26.2Z"
            fill="currentColor"
          />
          <path
            d="M34.5 13H38V35H34.5V17.4L31.2 19.6V15.9L34.5 13Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-display text-xs sm:text-sm md:text-base font-semibold tracking-[0.12em] sm:tracking-[0.14em] text-white whitespace-nowrap uppercase">
          A1 TILING PTY LTD
        </span>
      )}
    </div>
  );
}
