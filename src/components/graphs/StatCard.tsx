interface StatCardProps {
  title: string;
  value: string;
  unit: string;
  subtext: string;
  color: "orange" | "pink" | "green";
}

export function StatCard({
  title,
  value,
  unit,
  subtext,
  color,
}: StatCardProps) {
  const colorMap = {
    orange: "text-orange-3",
    pink: "text-pink-3",
    green: "text-green-3",
  };

  return (
    <div className="bg-black-2 rounded-level-2 p-6">
      <h3 className="text-sm font-light text-grey mb-4">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-6xl font-light ${colorMap[color]}`}>
          {value}
        </span>
        <span className={`text-2xl font-light ${colorMap[color]}`}>{unit}</span>
      </div>
      <p className="text-xs text-grey mt-2">{subtext}</p>
    </div>
  );
}
