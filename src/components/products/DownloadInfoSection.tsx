interface DownloadInfoSectionProps {
  title: string;
  items: Array<{
    title: string;
    description: string;
  }>;
}

export function DownloadInfoSection({ title, items }: DownloadInfoSectionProps) {
  return (
    <div className="mx-auto max-w-4xl mt-24 mb-16">
      <h2 className="text-3xl font-light text-center mb-12 text-white">
        {title}
      </h2>
      <div className="space-y-8">
        {items.map((item, index) => (
          <div key={index}>
            <h3 className="text-lg font-light text-white">{item.title}</h3>
            <p className="mt-2 text-grey">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
