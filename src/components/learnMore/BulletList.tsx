import { BulletListItem } from "./BulletListItem";

interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  return (
    <ul className="space-y-3 text-gray-200 drop-shadow">
      {items.map((item, index) => (
        <BulletListItem key={index} text={item} />
      ))}
    </ul>
  );
}
