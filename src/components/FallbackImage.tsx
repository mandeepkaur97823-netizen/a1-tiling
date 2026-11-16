import { useState } from "react";
import { Layers } from "lucide-react";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}

export function FallbackImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#151515] via-[#1f1f1f] to-[#0a0a0a] text-[#B8B8B8] p-6 text-center ${className}`}
      >
        <Layers className="w-8 h-8 mb-3 text-white/40" strokeWidth={1.25} />
        <p className="text-xs tracking-wide text-white/60 max-w-xs">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
