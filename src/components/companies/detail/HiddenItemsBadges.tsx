// New component: src/components/companies/detail/HiddenItemsBadges.tsx
import { X } from "lucide-react";

interface HiddenItemsBadgesProps {
  hiddenScopes: Array<"scope1" | "scope2" | "scope3">;
  hiddenCategories: number[];
  onScopeToggle: (scope: "scope1" | "scope2" | "scope3") => void;
  onCategoryToggle: (categoryId: number) => void;
  getCategoryName: (id: number) => string;
  getCategoryColor: (id: number) => string;
}

export function HiddenItemsBadges({
  hiddenScopes,
  hiddenCategories,
  onScopeToggle,
  onCategoryToggle,
  getCategoryName,
  getCategoryColor,
}: HiddenItemsBadgesProps) {
  const getScopeColor = (scope: string) => {
    switch (scope) {
      case "scope1":
        return "var(--pink-3)";
      case "scope2":
        return "var(--green-2)";
      case "scope3":
        return "var(--blue-2)";
      default:
        return "var(--white)";
    }
  };

  if (hiddenScopes.length === 0 && hiddenCategories.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 mt-4">
      {hiddenScopes.map((scope) => (
        <button
          key={scope}
          onClick={() => onScopeToggle(scope)}
          className="px-2 py-1 text-sm bg-black-1 rounded-md flex items-center gap-1 hover:bg-black-3 transition-colors"
          style={{ color: getScopeColor(scope) }}
        >
          {scope === "scope1"
            ? "Scope 1"
            : scope === "scope2"
              ? "Scope 2"
              : "Scope 3"}
          <X className="w-3 h-3" />
        </button>
      ))}
      {hiddenCategories.map((categoryId) => (
        <button
          key={categoryId}
          onClick={() => onCategoryToggle(categoryId)}
          className="px-2 py-1 text-sm bg-black-1 rounded-md flex items-center gap-1 hover:bg-black-3 transition-colors"
          style={{ color: getCategoryColor(categoryId) }}
        >
          {getCategoryName(categoryId)}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}
