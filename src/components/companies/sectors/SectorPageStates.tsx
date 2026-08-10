type SectorErrorProps = {
  title: string;
  description: string;
};

export const SectorLoading = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-64 bg-black-2 rounded-level-2" />
    ))}
  </div>
);

export const SectorError = ({ title, description }: SectorErrorProps) => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-light text-red-500">{title}</h2>
    <p className="text-grey mt-2">{description}</p>
  </div>
);
