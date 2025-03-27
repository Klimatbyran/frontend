interface SectionHeaderProps {
  title: string;
  description: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16 bg-black/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-3 to-blue-4 drop-shadow-lg">
        {title}
      </h2>
      <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow">
        {description}
      </p>
    </div>
  );
}
