import type { ElementType } from "react";
import { useTranslation } from "react-i18next";
import type { CombinedData } from "@/hooks/useCombinedData";
import { CommandItem } from "../ui/command";
import SearchResultItem from "./SearchResultItem";

interface SearchResultListProps {
  list: CombinedData[];
  icon: ElementType;
  translationKey: string;
  onSelectResponse: (response: CombinedData) => void;
  setOpen: (open: boolean) => void;
}

const SearchResultList = ({
  list,
  icon: Icon,
  translationKey,
  onSelectResponse,
  setOpen,
}: SearchResultListProps) => {
  const { t } = useTranslation();

  if (!list || list.length === 0) return null;

  return (
    <div className="pt-4">
      <p className="text-sm flex items-center gap-2">
        <Icon size={15} /> {t(translationKey)}
      </p>
      {list.slice(0, 5).map((item) => (
        <CommandItem
          key={item.id}
          onSelect={() => {
            onSelectResponse(item);
            setOpen(false);
          }}
          className="px-4 py-3"
        >
          <SearchResultItem item={item} />
        </CommandItem>
      ))}
    </div>
  );
};

export default SearchResultList;
