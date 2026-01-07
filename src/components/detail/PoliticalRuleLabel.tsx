import { useState } from "react";

interface PoliticalRuleLabelProps {
  src: string;
  alt: string;
  fallback: string;
}

export function PoliticalRuleLabel({
  src,
  alt,
  fallback,
}: PoliticalRuleLabelProps) {
  const [error, setError] = useState(false);

  const onError = () => {
    setError(true);
  };

  return error ? (
    fallback
  ) : (
    <img
      src={src}
      alt={alt}
      onError={onError}
      className="h-[20px] md:h-[25px] inline"
    />
  );
}
