import { cn } from "@/lib/utils";
import { useLanguage } from "../../LanguageProvider";

export function HeaderLanguageButtons({ className }: { className?: string }) {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => changeLanguage("en")}
        className={cn(
          currentLanguage === "en" && "bg-black-1 rounded-full px-1",
        )}
      >
        🇬🇧
      </button>
      <span className="text-grey">|</span>
      <button
        onClick={() => changeLanguage("sv")}
        className={cn(
          currentLanguage === "sv" && "bg-black-1 rounded-full px-1",
        )}
      >
        🇸🇪
      </button>
    </div>
  );
}
