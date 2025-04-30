import { Input } from "@/components/ui/input";
import { CircleXIcon, GemIcon, PanelRightCloseIcon } from "lucide-react";
import { helpItems } from "./items";
import { ChangeEvent, useMemo, useState } from "react";

type SidebarProps = {
  initialFilter: string;
  onClose: () => void;
};

export const Sidebar = ({ initialFilter, onClose }: SidebarProps) => {
  const [filter, setFilter] = useState(initialFilter);

  const filteredItems = useMemo(() => {
    const filterLC = filter.toLowerCase();

    return Object.values(helpItems)
      .filter((i) => i.title.toLowerCase().includes(filterLC))
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
      );
  }, [filter]);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  return (
    <>
      <div className="flex align-center">
        <GemIcon className="w-8 h-8 mr-2" />
        <h2 className="text-2xl">Data Guide</h2>
        <button
          onClick={onClose}
          className="ml-auto focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none bg-gray-700 hover:bg-gray-600 active:ring-1 active:ring-white disabled:opacity-50 p-2 rounded-md"
        >
          <PanelRightCloseIcon />
        </button>
      </div>
      <div className="relative inline-block">
        <Input
          type="text"
          disabled={false}
          className="border-white pr-2"
          value={filter}
          onChange={handleOnChange}
        />
        {filter !== "" && (
          <button
            type="button"
            onClick={() => setFilter("")}
            className="absolute top-1/2 transform -translate-y-1/2 right-2 cursor-pointer"
          >
            <CircleXIcon className="text-gray-400 h-5 w-5" />
          </button>
        )}
      </div>
      <div className="overflow-y-auto">
        {filteredItems.map(({ id, title: itemTitle, component: C }) => (
          <section key={id}>
            <h2 className="text-xl mt-4 font-bold">{itemTitle}</h2>
            <C key={id} />
          </section>
        ))}
      </div>
    </>
  );
};
