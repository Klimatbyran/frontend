import type { Token } from "@/types/token";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../LanguageProvider";
import { NewsletterPopover } from "../../newsletters/NewsletterPopover";
import { HeaderSearchButton } from "../../search/HeaderSearchButton";
import { LocalizedLink } from "../../LocalizedLink";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../ui/navigation-menu";
import { HeaderLanguageButtons } from "./HeaderLanguageButtons";
import { isNavLinkActive } from "./navActive";
import { INTERNAL_LINKS } from "./navConfig";
import { SubLinksMenu } from "./SubLinksMenu";
import { NavLink } from "./types";

const disableOpenOnHoverDelay = 999999;

export function HeaderDesktopNav({
  navLinks,
  user,
  isSignUpOpen,
  onSignUpOpenChange,
}: {
  navLinks: NavLink[];
  user: Token | null;
  isSignUpOpen: boolean;
  onSignUpOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentLanguage } = useLanguage();

  return (
    <NavigationMenu
      className="hidden lg:flex items-center ml-auto"
      delayDuration={disableOpenOnHoverDelay}
    >
      <NavigationMenuList>
        {navLinks.map((item) => {
          const isActive = isNavLinkActive(
            location.pathname,
            currentLanguage,
            item,
          );

          return item.sublinks ? (
            <NavigationMenuItem key={item.path}>
              <NavigationMenuTrigger
                className={cn(
                  "flex gap-2 p-3",
                  isActive
                    ? "!text-white !bg-transparent data-[state=open]:!bg-transparent data-[state=closed]:bg-transparent"
                    : "data-[state=open]:bg-black-1 data-[state=closed]:bg-transparent text-grey hover:text-white",
                )}
              >
                {item.icon}
                {t(item.label)}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-56 w-full p-3 top-12 bg-black-2">
                <SubLinksMenu sublinks={item.sublinks} />
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem
              key={item.path}
              className={cn(
                "h-10 lg:h12 flex items-center",
                isActive ? "!text-white" : "text-grey hover:text-white",
              )}
            >
              <NavigationMenuLink asChild>
                <LocalizedLink
                  to={item.path}
                  className="flex gap-2 p-3 items-center"
                >
                  {item.icon}
                  {t(item.label)}
                </LocalizedLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
        {user && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex items-center gap-2 px-3 py-3 h-full transition-all text-sm cursor-pointer text-grey hover:text-white">
              <span>Internal</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <SubLinksMenu sublinks={INTERNAL_LINKS} />
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
      <div className="ml-4 h-full flex items-center">
        <HeaderSearchButton className="mx-2" />
        <HeaderLanguageButtons className="hidden md:flex mx-4" />
        <NewsletterPopover
          isOpen={isSignUpOpen}
          onOpenChange={onSignUpOpenChange}
          buttonText={t("header.newsletter")}
        />
      </div>
    </NavigationMenu>
  );
}
