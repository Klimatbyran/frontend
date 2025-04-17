import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectorProps<T extends string> {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
}

export function Selector<T extends string>({
  label,
  value,
  onValueChange,
  options,
  placeholder,
}: SelectorProps<T>) {
  return (
    <div className="flex-1 space-y-2">
      <label className="text-sm text-grey">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-black-2 border-black-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 