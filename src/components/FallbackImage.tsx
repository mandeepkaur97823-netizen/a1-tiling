import { useEffect, useState } from "react";
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
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setAttempt(0);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (attempt === 0) {
      setAttempt(1);
      if (currentSrc.includes("/src/assets/images/")) {
        setCurrentSrc(currentSrc.replace("/src/assets/images/", "/images/"));
        return;
      }
      if (currentSrc.startsWith("/images/")) {
        setCurrentSrc(currentSrc.replace("/images/", "/src/assets/images/"));
        return;
      }
      if (currentSrc.startsWith("/")) {
        setCurrentSrc(currentSrc.slice(1));
        return;
      }
    } else if (attempt === 1) {
      setAttempt(2);
      const filename = currentSrc.split("/").pop();
      if (filename) {
        setCurrentSrc(`/assets/images/${filename}`);
        return;
      }
    }
    setFailed(true);
  };

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
      src={currentSrc}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
}
