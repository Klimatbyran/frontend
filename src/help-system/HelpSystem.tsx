import {
  ChangeEvent,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { HelpItem, HelpItemId, helpItems } from "./items";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HelpSystemContext {
  openHelp: (title: string, items: HelpItemId[]) => void;
}

const HelpSystemContext = createContext<HelpSystemContext>({
  openHelp: () => {},
});

export const useHelpSystem = () => {
  const context = useContext(HelpSystemContext);
  if (!context) {
    throw new Error("useHelpSystem must be used within a HelpSystemProvider");
  }
  return context;
};

export const HelpSystemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<HelpItem[]>([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("");

  const showHelp = (title: string, showIds: HelpItemId[]) => {
    setTitle(title);

    setSelectedItems(
      showIds.length > 0
        ? showIds.map((sId) => helpItems[sId]).filter((s) => s !== undefined)
        : Object.values(helpItems),
    );
    setOpen(true);
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const items = useMemo(() => {
    const filterLC = filter.toLowerCase();
    return selectedItems
      .filter((i) => i.title.toLowerCase().includes(filterLC))
      .sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
      );
  }, [filter, selectedItems]);

  const global = selectedItems.length === 0;

  console.log("Rerender", selectedItems);
  // Only show the item titles if there are more than one
  const showItemTitles = selectedItems.length > 1;

  return (
    <HelpSystemContext.Provider value={{ openHelp: showHelp }}>
      <div>
        <div
          className={cn(
            "transition-all duration-300",
            open ? "mr-[300px]" : "",
          )}
        >
          {children}
        </div>
        <div className={cn("relative", open ? "w-[300px]" : "")}>
          <Button
            size="sm"
            className={cn(
              "absolute top-1/2 transform -rotate-90 origin-bottom-right right-0 bg-gray-800 rounded-none transition-all duration-300",
              open ? "mr-[300px]" : "",
            )}
            onClick={() => (open ? setOpen(!open) : showHelp("Data Guide", []))}
          >
            Data Guide 2
          </Button>
          <div
            className={cn(
              "p-4 bg-gray-800 w-[300px] fixed top-[50px] right-0 h-screen flex flex-col gap-4 transition-all duration-300",
              open ? "" : "translate-x-full",
            )}
          >
            <Button
              variant="ghost"
              onClick={() => setOpen(!open)}
              className="absolute top-0 right-0 rounded-none"
            >
              Close
            </Button>
            <div className="flex justify-between">
              <h2 className="text-2xl">{title}</h2>
            </div>
            <Input
              type="text"
              disabled={false}
              className="border-white"
              value={filter}
              onChange={handleOnChange}
            />
            <div className="overflow-y-auto">
              {items.map(({ id, title: itemTitle, component: C }) => (
                <section key={id}>
                  {showItemTitles && (
                    <h2 className="text-xl mt-4 font-bold">{itemTitle}</h2>
                  )}
                  <C key={id} />
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HelpSystemContext.Provider>
  );
};
