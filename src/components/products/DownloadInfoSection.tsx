import type React from "react";

interface DownloadInfoSectionProps {
  title: string;
  items: Array<{
    title: string;
    description: string | React.ReactNode;
  }>;
}

export function DownloadInfoSection({
  title,
  items,
}: DownloadInfoSectionProps) {
  return (
    <section className="mb-16 mt-4">
      <h2 className="mb-6 text-2xl font-light text-white">{title}</h2>
      <div className="space-y-4 rounded-level-1 bg-black-2 p-6 md:p-8">
        {items.map((item) => (
          <div
            key={item.title}
            className="border-b border-black-1 pb-6 last:border-b-0 last:pb-0"
          >
            <h3 className="text-lg font-medium text-white">{item.title}</h3>
            <div className="mt-2 text-grey">{item.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
