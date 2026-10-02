import { useState } from "react";
import { Plus } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

/** The methodology in two plain paragraphs, folded away until asked for. */
export function ParisExplainer() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="max-w-[640px] rounded-2xl bg-black-2"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] text-blue-2">
        {t("companiesOverviewPage.paris.explainerTitle")}
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
            i18nKey="companiesOverviewPage.paris.explainerBudget"
            components={{ strong: <strong className="text-white" /> }}
          />
        </p>
        <p>
          <Trans
            i18nKey="companiesOverviewPage.paris.explainerVerdict"
            components={{ strong: <strong className="text-white" /> }}
          />
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
