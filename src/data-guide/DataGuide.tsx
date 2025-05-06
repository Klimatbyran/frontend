import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

export interface DataGuideContext {
  openDataGuide: (filter: string) => void;
}

const DataGuideContext = createContext<DataGuideContext>({
  openDataGuide: () => {},
});

export const useDataGuide = () => {
  const context = useContext(DataGuideContext);
  if (!context) {
    throw new Error("useDataGuide must be used within a DataGuideProvider");
  }
  return context;
};

export const DataGuideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [initialFilter, setInitialFilter] = useState("");

  const updateOpen = (o: boolean) => {
    setOpen(o);
  };

  // This provides a way for
  const openDataGuide = useCallback((filter: string) => {
    setInitialFilter(filter);
    updateOpen(true);
  }, []);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <DataGuideContext.Provider value={{ openDataGuide: openDataGuide }}>
      <div
        className={cn(
          "transition-all duration-300",
          open ? "mr-[calc(300px+1rem)]" : "mr-[1rem]",
        )}
      >
        {children}
      </div>
      <Sidebar
        initialFilter={initialFilter}
        toggleOpen={toggleOpen}
        open={open}
      />
    </DataGuideContext.Provider>
  );
};
