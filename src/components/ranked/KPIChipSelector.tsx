import { useId, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { KPIValue } from "@/types/rankings";

interface KPIChipSelectorProps<T> {
  selectedKPI: KPIValue<T>;
  kpis: KPIValue<T>[];
  onKPIChange: (kpi: KPIValue<T>) => void;
  /** Optional icon for each KPI key */
  iconMap?: Record<string, React.ReactNode>;
  /** i18n prefix for kpi labels, e.g. "municipalities.list" */
  translationPrefix?: string;
  /** Label shown above the chips / as the dropdown trigger label */
  label?: string;
  /** Tighter spacing for data-dense overview pages */
  compact?: boolean;
}

export function KPIChipSelector<T>({
  selectedKPI,
  kpis,
  onKPIChange,
  iconMap = {},
  translationPrefix,
  label,
  compact = false,
}: KPIChipSelectorProps<T>) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        e.target instanceof Node &&
        !dropdownRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const getLabel = (kpi: KPIValue<T>) => {
    if (translationPrefix) {
      return t(`${translationPrefix}.kpis.${String(kpi.key)}.label`);
    }
    return kpi.label;
  };

  const selectorLabel = label ?? t("municipalities.list.dataSelector.label");

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMobileOpen((o) => !o);
    }
    if (e.key === "Escape") setMobileOpen(false);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, kpi: KPIValue<T>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onKPIChange(kpi);
      setMobileOpen(false);
    }
    if (e.key === "Escape") setMobileOpen(false);
  };

  return (
    <div className={cn(compact ? "mb-4 space-y-2" : "mb-6 space-y-3")}>
      {selectorLabel && (
        <p className="text-xs text-white/50 uppercase tracking-wider px-1">
          {selectorLabel}
        </p>
      )}

      {/* Mobile: dropdown */}
      <div className="md:hidden relative" ref={dropdownRef}>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={mobileOpen}
          aria-controls={menuId}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-black-1 text-white"
        >
          <span className="flex items-center gap-2 font-medium">
            {iconMap[String(selectedKPI.key)]}
            {getLabel(selectedKPI)}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "w-4 h-4 text-white/60 transition-transform",
              mobileOpen && "rotate-180",
            )}
          />
        </button>
        {mobileOpen && (
          <div
            id={menuId}
            role="listbox"
            aria-label={selectorLabel || undefined}
            className="absolute z-50 w-full mt-1 bg-black-1 rounded-xl shadow-xl overflow-hidden border border-white/10"
          >
            {kpis.map((kpi) => {
              const isSelected = String(kpi.key) === String(selectedKPI.key);
              return (
                <button
                  key={String(kpi.key)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onKPIChange(kpi);
                    setMobileOpen(false);
                  }}
                  onKeyDown={(e) => handleItemKeyDown(e, kpi)}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors",
                    isSelected
                      ? "bg-blue-3/20 text-blue-3"
                      : "text-white hover:bg-white/10",
                  )}
                >
                  {iconMap[String(kpi.key)]}
                  {getLabel(kpi)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: chips */}
      <div
        className="hidden md:flex gap-2 flex-wrap"
        role="group"
        aria-label={selectorLabel || undefined}
      >
        {kpis.map((kpi) => {
          const isSelected = String(kpi.key) === String(selectedKPI.key);
          return (
            <button
              key={String(kpi.key)}
              onClick={() => onKPIChange(kpi)}
              title={kpi.description}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
                isSelected
                  ? "bg-blue-3/20 border-blue-3 text-blue-3 shadow-[0_0_12px_rgba(76,155,232,0.3)]"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white",
              )}
            >
              {iconMap[String(kpi.key)]}
              {getLabel(kpi)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
