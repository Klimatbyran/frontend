import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";

interface NationStorySectionProps {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function NationStorySection({
  id,
  title,
  children,
  className = "",
}: NationStorySectionProps) {
  return (
    <section
      id={id}
      className={`w-full max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 ${className}`}
    >
      <Text variant="h2" className="text-3xl md:text-4xl font-light mb-8">
        {title}
      </Text>
      <div className="space-y-6 text-grey text-lg leading-relaxed">{children}</div>
    </section>
  );
}
