interface BulletListItemProps {
  text: string;
}

export function BulletListItem({ text }: BulletListItemProps) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-blue-3 mt-1 flex-shrink-0">•</span>
      <span className="flex-1">{text}</span>
    </li>
  );
}
