import React, { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface DataSelectorProps<T> {
  label: string;
  selectedItem: T;
  items: T[];
  onItemChange: (item: T) => void;
  getItemLabel: (item: T) => string;
  getItemKey: (item: T) => string;
  getItemDescription?: (item: T) => string | undefined;
  getItemDetailedDescription?: (item: T) => React.ReactNode | undefined;
  icon?: React.ReactNode;
}

export function DataSelector<T>({
  label,
  selectedItem,
  items,
  onItemChange,
  getItemLabel,
  getItemKey,
  getItemDescription,
  getItemDetailedDescription,
  icon,
}: DataSelectorProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemSelect = (item: T) => {
    onItemChange(item);
    setIsOpen(false);
  };

  return (
    <div className="dark:bg-black-2 bg-grey/10 rounded-2xl p-4 mb-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs dark:text-gray-500 text-grey px-2 pb-2">
          {icon}
          <label className="font-medium">{label}</label>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl dark:bg-black-1 bg-grey/10 dark:text-white text-black-3 transition-colors"
          >
            <span className="text-left font-medium">
              {getItemLabel(selectedItem)}
            </span>
            <ChevronDown
              className={`w-5 h-5 dark:text-white text-black-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 dark:bg-black-1 bg-white rounded-xl shadow-lg overflow-hidden backdrop-blur-sm border dark:border-white/10 border-grey/20">
              {items.map((item) => {
                const isSelected =
                  getItemKey(item) === getItemKey(selectedItem);
                return (
                  <button
                    key={getItemKey(item)}
                    onClick={() => handleItemSelect(item)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      isSelected
                        ? "dark:bg-gray-700/80 bg-blue-5/20 dark:text-blue-300 text-blue-2"
                        : "dark:text-white text-black-3 dark:hover:bg-gray-700/80 hover:bg-grey/10"
                    }`}
                  >
                    <span className="font-medium">{getItemLabel(item)}</span>
                    {getItemDescription?.(item) && (
                      <p className="text-xs dark:text-white/50 text-black-3/50 mt-1">
                        {getItemDescription(item)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {getItemDetailedDescription?.(selectedItem) && (
          <p className="leading-relaxed text-sm px-2 py-1 dark:text-gray-500 text-grey">
            {getItemDetailedDescription(selectedItem)}
          </p>
        )}
      </div>
    </div>
  );
}
