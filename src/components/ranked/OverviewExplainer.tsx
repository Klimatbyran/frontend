import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** Short methodology, folded away until asked for. Same pattern as the company overview. */
export function OverviewExplainer({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="max-w-[640px] rounded-2xl bg-black-2"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] text-blue-2">
        {title}
        <Plus
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-45",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-white/65">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Title and one sentence above a section, matching the company overview cards. */
export function OverviewSectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-light md:text-[21px]">{title}</h2>
      <p className="mt-2 max-w-[640px] text-sm leading-relaxed text-white/60">
        {description}
      </p>
    </div>
  );
}
