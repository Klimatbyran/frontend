import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-blue-3/50 transition-colors shadow-xl">
      {icon}
      <h3 className="text-xl font-semibold mb-3 text-white drop-shadow-lg">
        {title}
      </h3>
      <p className="text-gray-200 drop-shadow">{description}</p>
    </div>
  );
}
