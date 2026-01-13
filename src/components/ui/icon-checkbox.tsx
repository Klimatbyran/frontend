import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  badgeIconClass?: string;
}

const IconCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  IconCheckboxProps
>(({ className, badgeIconClass = "", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-9 w-9 shrink-0 rounded-sm border flex items-center justify-center text-grey shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-green-2",
      className,
    )}
    {...props}
  >
    <BadgeCheck className={badgeIconClass} />
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <CheckIcon className="h-4 w-4 hidden" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
IconCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { IconCheckbox };
