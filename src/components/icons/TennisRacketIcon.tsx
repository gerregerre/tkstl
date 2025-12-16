import { cn } from "@/lib/utils";

interface TennisRacketIconProps {
  className?: string;
}

export function TennisRacketIcon({ className }: TennisRacketIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <ellipse
        cx="14"
        cy="8"
        rx="6"
        ry="7"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8 13L3 21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Racket strings */}
      <line x1="11" y1="3" x2="11" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      <line x1="14" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      <line x1="17" y1="3" x2="17" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      <line x1="9" y1="5" x2="19" y2="5" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      <line x1="8.5" y1="8" x2="19.5" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      <line x1="9" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}
