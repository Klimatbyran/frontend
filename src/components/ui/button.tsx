import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-black-2 text-white hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50",
        outline:
          "border border-white bg-transparent hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50",
        ghost:
          "bg-transparent hover:bg-white/10 active:ring-1 active:ring-white disabled:opacity-50",
        icon: "h-10 w-10 rounded-full bg-black-2 hover:opacity-80 active:ring-1 active:ring-white disabled:opacity-50",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4",
        lg: "h-12 px-8",
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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
