import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Package, type LucideIcon } from "lucide-react";
import {
  UPSTREAM_CATEGORIES,
  DOWNSTREAM_CATEGORIES,
} from "@/lib/constants/categories";
import { buildCategoryMetadata } from "./categoryMetadata";
export type { CategoryType } from "./categoryMetadata";

export const useCategoryMetadata = () => {
  const { t } = useTranslation();

  const categoryMetadata = useMemo(() => buildCategoryMetadata(t), [t]);

  const getCategoryIcon = (id: number): LucideIcon => {
    return categoryMetadata[id]?.icon || Package;
  };

  const getCategoryColor = (id: number): string => {
    return categoryMetadata[id]?.color || "var(--blue-2)";
  };

  const getCategoryName = (id: number): string => {
    return (
      categoryMetadata[id]?.name || t(`category.${id}.name`, `Kategori ${id}`)
    );
  };

  const getCategoryDescription = (id: number): string => {
    return categoryMetadata[id]?.description || "";
  };

  const getCategoryType = (id: number): CategoryType => {
    return categoryMetadata[id]?.type || "upstream";
  };

  const getCategoryFilterColors = (category: number) => {
    const color = getCategoryColor(category)
      .replace("var(--", "")
      .replace(")", "");
    const [palette, shade] = color.split("-");
    return {
      bg: `bg-${palette}-5/30`,
      text: `text-${palette}-${shade}`,
    };
  };

  return {
    categoryMetadata,
    getCategoryIcon,
    getCategoryColor,
    getCategoryName,
    getCategoryDescription,
    getCategoryType,
    getCategoryFilterColors,
    upstreamCategories: UPSTREAM_CATEGORIES,
    downstreamCategories: DOWNSTREAM_CATEGORIES,
  };
};
