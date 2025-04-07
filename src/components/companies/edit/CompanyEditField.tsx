import { Input } from "@/components/ui/input";
import { IconCheckbox } from "@/components/ui/icon-checkbox";

export interface CompanyEditInputFieldProps {
  type: "date" | "number" | "text";
  value: number | string;
  name: string;
  showVerified?: boolean;
  verified?: boolean;
  onInputChange: (name: string, value: string) => void;
}

export function CompanyEditInputField({
  type,
  value,
  name,
  showVerified = true,
  verified,
  onInputChange,
}: CompanyEditInputFieldProps) {
  const handleChange = (event) => {
    onInputChange(name, event.target.value);
  };

  const handleCheckboxChange = (event) => {
    onInputChange(name + "-checkbox", event);
  };

  return (
    <div
      key={name + "-container"}
      className="flex items-center w-[187px] ms-2 py-2 border-r border-white"
    >
      <Input
        key={name}
        name={name}
        type={type}
        onChange={handleChange}
        className="w-[150px] bg-black-1"
        defaultValue={type === "date" ? value : undefined}
        placeholder={String(value)}
      ></Input>
      {showVerified && (
        <IconCheckbox
          key={name + "-checkbox"}
          defaultChecked={verified}
          name={name + "-checkbox"}
          onCheckedChange={handleCheckboxChange}
        />
      )}
    </div>
  );
}

export function CompanyYearHeaderField({ text }: { text: string }) {
  return (
    <div
      key={Math.random() * 1000 + "-container"}
      className="w-[187px] text-right ms-2 pe-2 border-r border-white min-h-[36px]"
    >
      {text}
    </div>
  );
}

export function CompanyEmptyField() {
  return (
    <div
      key={Math.random() * 1000 + "-container"}
      className="w-[187px] py-2 border-r ms-2 border-white min-h-[36px]"
    ></div>
  );
}
