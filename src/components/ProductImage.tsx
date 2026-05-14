import { useState } from "react";

type Props = {
  src?: string;
  alt: string;
  className?: string;
};

export function ProductImage({ src, alt, className = "" }: Props) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-lg bg-slate-100 ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
          loading="lazy"
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-1/2 w-1/2 text-slate-400"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="M21 15l-5-5-9 9" />
        </svg>
      )}
    </div>
  );
}
