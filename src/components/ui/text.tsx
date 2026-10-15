import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("font-light tracking-tight", {
  variants: {
    variant: {
      // Large display text (like in ContentBlock)
      display: "text-[64px] leading-[1.1] tracking-[-0.02em]",
      // Heading variants
      h1: "text-7xl",
      h2: "text-5xl",
      h3: "text-4xl",
      h4: "text-3xl",
      h5: "text-2xl",
      h6: "text-xl",
      // Body text variants
      body: "text-base",
      small: "text-sm",
      tiny: "text-xs",
    },
    weight: {
      light: "font-light",
      regular: "font-normal",
      medium: "font-medium",
    },
  },
  defaultVariants: {
    variant: "body",
    weight: "light",
  },
});

interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: keyof JSX.IntrinsicElements;
}

export function Text({
  className,
  variant,
  weight,
  as: Component = "p",
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariants({ variant, weight }), className)}
      {...props}
    />
  );
}
