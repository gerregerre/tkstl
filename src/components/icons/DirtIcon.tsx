import { cn } from "@/lib/utils";

interface DirtIconProps {
  className?: string;
}

export function DirtIcon({ className }: DirtIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-6 h-6", className)}
    >
      <ellipse
        cx="12"
        cy="16"
        rx="9"
        ry="4"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M6 14C6 14 7 12 9 12C11 12 10 14 12 14C14 14 13 12 15 12C17 12 18 14 18 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="14" cy="9" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="16" cy="11" r="0.75" fill="currentColor" opacity="0.5" />
      <path
        d="M10 7L10 5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M12 6L13 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
