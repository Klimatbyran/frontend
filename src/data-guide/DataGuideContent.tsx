import { Input } from "@/components/ui/input";
import { CircleXIcon } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { dataGuideHelpItems, HelpItemId } from "./guide-items";
import { SidebarGuideItem } from "./SidebarGuideItem";

type DataGuideContentProps = {
  items: HelpItemId[];
};

export const DataGuideContent = ({ items }: DataGuideContentProps) => {
  const [filter, setFilter] = useState("");

  const filteredItems = useMemo(() => {
    const filterLC = filter.toLowerCase();

    return Object.values(dataGuideHelpItems)
      .filter((i) => items.includes(i.id))
      .filter((i) => i.title.toLowerCase().includes(filterLC))
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
      );
  }, [filter, items]);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const resetFilter = () => setFilter("");

  return (
    <div className="h-full">
      <div className="relative mt-4">
        <Input
          type="text"
          className="border-white pr-2"
          name="filter"
          aria-label="Filter Data Guide"
          placeholder="Filter guide sections"
          value={filter}
          onChange={handleOnChange}
        />
        {filter !== "" && (
          <button
            type="button"
            onClick={resetFilter}
            className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor-pointer"
          >
            <CircleXIcon className="text-gray-400 h-5 w-5" />
          </button>
        )}
      </div>
      <div className="h-[calc(100%-5rem)] overflow-y-auto overscroll-contain">
        {filteredItems.map(
          ({ id, title: itemTitle, component: ItemComponent }) => (
            <SidebarGuideItem key={id} title={itemTitle}>
              <ItemComponent />
            </SidebarGuideItem>
          ),
        )}
      </div>
    </div>
  );
};
