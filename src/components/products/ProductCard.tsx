import React from "react";

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
  textColor: string;
}

export const FeatureItem = ({ icon, text, textColor }: FeatureItemProps) => (
  <li className={`flex items-center gap-3 ${textColor}`}>
    {icon}
    <span>{text}</span>
  </li>
);

export interface ProductCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
  actions: React.ReactNode;
  bgColor: string;
  borderColor: string;
  hoverBorderColor: string;
  textColor: string;
  iconBgColor: string;
  iconColor: string;
}

export const ProductCard = ({
  title,
  description,
  icon,
  features,
  actions,
  bgColor,
  borderColor,
  hoverBorderColor,
  textColor,
  iconBgColor,
  iconColor,
}: ProductCardProps) => (
  <div
    className={`${bgColor} border ${borderColor} p-8 shadow-lg hover:${hoverBorderColor} transition-colors first:rounded-t-2xl last:rounded-b-2xl lg:first:rounded-l-2xl lg:first:rounded-tr-none lg:last:rounded-r-2xl lg:last:rounded-bl-none`}
  >
    <div className="flex items-center gap-4">
      <div className={`rounded-lg ${iconBgColor} p-3 border ${borderColor}`}>
        {icon}
      </div>
      <h2 className={`text-2xl font-light ${textColor}`}>{title}</h2>
    </div>
    <p className={`mt-4 ${textColor}`}>{description}</p>
    <ul className="mt-8 space-y-3">
      {features.map((feature, index) => (
        <FeatureItem
          key={index}
          icon={feature.icon}
          text={feature.text}
          textColor={textColor}
        />
      ))}
    </ul>
    <div className="mt-8 space-y-4">{actions}</div>
  </div>
);
