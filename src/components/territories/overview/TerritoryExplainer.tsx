import { useState } from "react";
import { Plus } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** How a place is judged, folded away until someone asks. */
export function TerritoryExplainer({ storyKey }: { storyKey: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="max-w-[640px] rounded-2xl bg-black-2"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] text-blue-2">
        {t(`${storyKey}.explainerTitle`)}
        <Plus
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-45",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-white/65">
        <p>
          <Trans
            i18nKey={`${storyKey}.explainerBudget`}
            components={[
              <LocalizedLink
                to="/methodology?view=carbonLaw"
                className="underline transition-colors hover:text-white"
              />,
            ]}
          />
        </p>
        <p>
          <Trans
            i18nKey={`${storyKey}.explainerVerdict`}
            components={{ strong: <strong className="text-white" /> }}
          />
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
