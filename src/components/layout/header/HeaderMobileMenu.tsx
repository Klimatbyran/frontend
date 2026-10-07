import { Mail, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../LanguageProvider";
import { HeaderSearchButton } from "../../search/HeaderSearchButton";
import { LocalizedLink } from "../../LocalizedLink";
import { HeaderLanguageButtons } from "./HeaderLanguageButtons";
import { isNavLinkActive } from "./navActive";
import { NavSubGroupSection } from "./NavSubGroupSection";
import { NavSubLinkItem } from "./NavSubLinkItem";
import { NAV_LINK_CLASS } from "./navStyles";
import { isNavSubGroup, NavLink } from "./types";

export function HeaderMobileMenu({
  navLinks,
  menuOpen,
  showTitle,
  headerTitle,
  onToggleMenu,
  onCloseMobileNav,
  onOpenNewsletter,
}: {
  navLinks: NavLink[];
  menuOpen: boolean;
  showTitle: boolean;
  headerTitle: string;
  onToggleMenu: () => void;
  onCloseMobileNav: () => void;
  onOpenNewsletter: () => void;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentLanguage } = useLanguage();

  return (
    <>
      {showTitle && headerTitle && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 max-w-[min(10rem,calc(100%-13.5rem))] -translate-x-1/2 -translate-y-1/2 truncate text-sm text-white lg:hidden">
          {headerTitle}
        </span>
      )}
      <div className="flex gap-6">
        <HeaderSearchButton
          className="w-full lg:hidden"
          closeMobileNav={onCloseMobileNav}
          iconOnly={showTitle && !!headerTitle}
        />

        <button
          className="lg:hidden text-white"
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {menuOpen && (
        <div className="overflow-y-auto fixed inset-0 top-10 w-full z-100 bg-black-2">
          <div className="p-8">
            <div className="flex flex-col gap-6 text-lg w-full">
              <HeaderLanguageButtons />
              {navLinks.map((link) => {
                const isActive = isNavLinkActive(
                  location.pathname,
                  currentLanguage,
                  link,
                );

                return (
                  <div key={link.path} className="flex flex-col">
                    <LocalizedLink
                      to={link.path}
                      onClick={onToggleMenu}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isActive
                          ? "!text-white font-medium"
                          : "text-grey hover:text-white",
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.icon}
                      {t(link.label)}
                    </LocalizedLink>
                    {link.sublinks && (
                      <div className="flex flex-col gap-2 pl-4 mt-2">
                        {link.sublinks.map((item) =>
                          isNavSubGroup(item) ? (
                            <NavSubGroupSection
                              key={item.label}
                              group={item}
                              onNavigate={onToggleMenu}
                            />
                          ) : (
                            <NavSubLinkItem
                              key={item.path}
                              sublink={item}
                              className={NAV_LINK_CLASS}
                              onNavigate={onToggleMenu}
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <button
                onClick={onOpenNewsletter}
                className="flex items-center gap-2 text-blue-3"
              >
                <Mail className="w-4 h-4" />
                {t("header.newsletter")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
