import { Input } from "@/components/ui/input";
import { GemIcon, PanelRightCloseIcon } from "lucide-react";
import { HelpItem } from "./items";
import { ChangeEvent, useState } from "react";

type SidebarProps = {
  title: string;
  items: HelpItem[];
  onClose: () => void;
};

export const Sidebar = ({ title, items, onClose }: SidebarProps) => {
  const [filter, setFilter] = useState("");

  const filterLC = filter.toLowerCase();
  const filteredItems = items
    .filter((i) => i.title.toLowerCase().includes(filterLC))
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  return (
    <>
      <div className="flex align-center">
        <GemIcon className="w-8 h-8 mr-2" />
        <h2 className="text-2xl">{title}</h2>
        <button
          onClick={onClose}
          className="ml-auto focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none bg-gray-700 hover:bg-gray-600 active:ring-1 active:ring-white disabled:opacity-50 p-2 rounded-md"
        >
          <PanelRightCloseIcon />
        </button>
      </div>
      <Input
        type="text"
        disabled={false}
        className="border-white"
        value={filter}
        onChange={handleOnChange}
      />
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
