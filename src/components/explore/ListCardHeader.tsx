import { cn } from "@/lib/utils";
import { useListCardHeader } from "@/hooks/useListCardHeader";

export interface ListCardHeaderProps {
  name: string;
  description: string;
  meetsParis: boolean | null;
  meetsParisTranslationKey: string;
  logoUrl?: string | null;
  isMunicipality: boolean;
  isRegion: boolean;
}

export function ListCardHeader({
  name,
  description,
  meetsParis,
  meetsParisTranslationKey,
  logoUrl,
  isMunicipality,
  isRegion,
}: ListCardHeaderProps) {
  const {
    meetsParisAnswer,
    meetsParisTitle,
    logo,
    meetsParisIsYes,
  } = useListCardHeader({
    meetsParis,
    meetsParisTranslationKey,
    logoUrl,
    isMunicipality,
    isRegion,
  });

  return (
    <div className="w-full">
      <div className="flex justify-between gap-1 items-start">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-light">{name}</h2>
          <p className="text-grey text-sm line-clamp-2 min-h-[40px]">
            {description}
          </p>
        </div>
        {logo}
      </div>
      <div className="w-full">
        <div className="flex items-center gap-2 text-grey text-lg">
          {meetsParisTitle}
        </div>
        <div
          className={cn(
            "w-full text-xl font-light border-b border-black-1 pb-6",
            meetsParisIsYes ? "text-green-3" : "text-pink-3",
          )}
        >
          {meetsParisAnswer}
        </div>
      </div>
    </div>
  );
}
