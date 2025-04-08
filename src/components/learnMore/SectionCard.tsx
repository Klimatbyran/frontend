import { ReactNode } from "react";
import { BulletList } from "./BulletList";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  items: string[];
}

export function SectionCard({
  icon,
  title,
  description,
  items,
}: SectionCardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-white/10 shadow-xl">
      {icon}
      <h3 className="text-2xl font-semibold mb-4 text-white drop-shadow-lg">
        {title}
      </h3>
      {description && (
        <p className="text-gray-200 drop-shadow mb-4">{description}</p>
      )}
      <BulletList items={items} />
    </div>
  );
}
