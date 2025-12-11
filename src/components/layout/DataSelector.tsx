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
    <div className="bg-black-2 light:bg-grey/10 rounded-2xl p-4 mb-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 light:text-grey px-2 pb-2">
          {icon}
          <label className="font-medium">{label}</label>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-black-1 light:bg-grey/10 text-white light:text-black-3 transition-colors"
          >
            <span className="text-left font-medium">
              {getItemLabel(selectedItem)}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-white light:text-black-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-black-1 light:bg-white rounded-xl shadow-lg overflow-hidden backdrop-blur-sm border border-white/10 light:border-grey/20">
              {items.map((item) => {
                const isSelected =
                  getItemKey(item) === getItemKey(selectedItem);
                return (
                  <button
                    key={getItemKey(item)}
                    onClick={() => handleItemSelect(item)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      isSelected
                        ? "bg-gray-700/80 light:bg-blue-5/20 text-blue-300 light:text-blue-4"
                        : "text-white light:text-black-3 hover:bg-gray-700/80 light:hover:bg-grey/10"
                    }`}
                  >
                    <span className="font-medium">{getItemLabel(item)}</span>
                    {getItemDescription?.(item) && (
                      <p className="text-xs text-white/50 light:text-black-3/50 mt-1">
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
          <p className="leading-relaxed text-sm px-2 py-1 text-gray-500 light:text-grey">
            {getItemDetailedDescription(selectedItem)}
          </p>
        )}
      </div>
    </div>
  );
}
