import { useEffect, useState, type ElementType } from "react";
import { useTranslation } from "react-i18next";
import type { CombinedData } from "@/hooks/useCombinedData";
import { CommandItem } from "../ui/command";
import SearchResultItem from "./SearchResultItem";
import { CirclePlus } from "lucide-react";

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

  const [itemsToLoad, setItemsToLoad] = useState(5);

  useEffect(() => setItemsToLoad(5), [list]);

  if (!list || list.length === 0) return null;

  return (
    <div className="pt-4">
      <p className="text-sm flex pb-2 items-center gap-2">
        <Icon size={15} /> {t(translationKey)}
      </p>
      {list.slice(0, itemsToLoad).map((item) => (
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
      {list.length > itemsToLoad && (
        <div className="flex py-2">
          <button
            className="m-auto text-gray-500 hover:opacity-50"
            onClick={() => setItemsToLoad(itemsToLoad + 5)}
          >
            <CirclePlus />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultList;
