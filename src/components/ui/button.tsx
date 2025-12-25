import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary/50 bg-transparent hover:bg-primary/10 hover:border-primary text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
        ghost: "hover:bg-muted/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // ATP Tour style variants
        atp: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-cyan hover:shadow-glow font-black",
        "atp-outline": "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground font-black",
        "atp-ghost": "bg-secondary/50 text-foreground hover:bg-secondary border border-border/50 font-bold",
        glass: "glass text-foreground hover:bg-muted/30 font-bold",
        // Legacy aliases
        gold: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-cyan hover:shadow-glow font-black",
        forest: "bg-secondary/80 text-foreground hover:bg-secondary border border-border font-bold backdrop-blur-sm",
        elegant: "bg-transparent text-foreground border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded px-4",
        lg: "h-12 rounded px-8 text-base",
        xl: "h-14 rounded px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };