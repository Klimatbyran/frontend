import { Input } from "@/components/ui/input";
import { CircleXIcon, XIcon } from "lucide-react";
import { HelpItemId, helpItems } from "./items";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  toggleOpen: () => void;
  open: boolean;
  className?: string;
  items: HelpItemId[];
};

export const Sidebar = ({
  className,
  open,
  toggleOpen,
  items,
}: SidebarProps) => {
  const [filter, setFilter] = useState("");
  const [inTransition, setInTransition] = useState(false);

  useEffect(() => {
    setInTransition(true);
  }, [open]);

  const transitionEnd = () => {
    setInTransition(false);
  };

  const filteredItems = useMemo(() => {
    const filterLC = filter.toLowerCase();

    return Object.values(helpItems)
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
    <div>
      <Button
        size="sm"
        className={cn(
          "fixed top-1/2 transform -rotate-90 origin-bottom-right right-0 bg-blue-5 rounded-none transition-all duration-300",
          open ? "mr-[300px]" : "",
        )}
        onClick={() => toggleOpen()}
      >
        Data Guide
      </Button>
      <div
        className={cn(
          "p-4 bg-blue-5 w-[300px] fixed top-[50px] right-0 h-screen flex flex-col gap-4 transition-all duration-300",
          open ? "" : "translate-x-full",
        )}
        onTransitionEnd={transitionEnd}
      >
        <div
          className={cn(
            className,
            "overflow-y-auto overscroll-contain",
            !open && !inTransition && "hidden",
          )}
        >
          <div className="flex align-center">
            <h2 className="text-2xl">Data Guide</h2>
            <button
              onClick={toggleOpen}
              className="ml-auto  focus-visible:ring-white disabled:pointer-events-none hover:bg-gray-700 active:ring-1 active:ring-white disabled:opacity-50 p-1 rounded-md mr-px mt-px"
            >
              <XIcon />
            </button>
          </div>
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
          <div className="overflow-y-auto">
            {filteredItems.map(
              ({ id, title: itemTitle, component: ItemComponent }) => (
                <section key={id}>
                  <h2 className="text-xl mt-4 font-bold">{itemTitle}</h2>
                  <ItemComponent key={id} />
                </section>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
