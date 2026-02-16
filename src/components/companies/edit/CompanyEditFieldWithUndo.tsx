import { Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CompanyEditRow } from "./CompanyEditRow";

export interface CompanyEditFieldWithUndoProps {
  label: string;
  value: string;
  originalValue: string;
  onChange: (value: string) => void;
  onUndo: () => void;
  type: "input" | "textarea";
  placeholder?: string;
  textareaRows?: number;
  "aria-label"?: string;
}

export function CompanyEditFieldWithUndo({
  label,
  value,
  originalValue,
  onChange,
  onUndo,
  type,
  placeholder,
  textareaRows = 3,
  "aria-label": ariaLabel,
}: CompanyEditFieldWithUndoProps) {
  const isUnchanged = value === originalValue;

  return (
    <CompanyEditRow name={label}>
      <div className="flex items-center min-w-0 py-2 ms-2">
        {type === "input" ? (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-w-[420px] align-right bg-black-1 border text-white"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={textareaRows}
            className="w-full min-w-[420px] p-2 border border-gray-300 rounded text-white bg-black-1"
          />
        )}
        <button
          type="button"
          onClick={onUndo}
          disabled={isUnchanged}
          className={`ml-2 bg-none border-none p-0 flex-shrink-0 ${
            isUnchanged ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          aria-label={ariaLabel ?? `Undo ${label} change`}
        >
          <Undo2
            className={
              isUnchanged ? "text-grey" : "text-white hover:text-orange-3"
            }
          />
        </button>
      </div>
    </CompanyEditRow>
  );
}
