import { cn } from "@/lib/utils";

interface CrownIconProps {
  className?: string;
  animated?: boolean;
}

export function CrownIcon({ className, animated = false }: CrownIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "w-6 h-6",
        animated && "animate-crown-shine",
        className
      )}
    >
      <path
        d="M2 17L4 7L8 11L12 4L16 11L20 7L22 17H2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 21H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
      <circle cx="4" cy="7" r="1" fill="currentColor" />
      <circle cx="20" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}
