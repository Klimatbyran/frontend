import { BarChart3, ChevronDown, Menu, X, Mail } from "lucide-react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { NewsletterPopover } from "../NewsletterPopover";
import { useLanguage } from "../LanguageProvider";
import { HeaderSearchButton } from "../search/HeaderSearchButton";
import { useScreenSize } from "@/hooks/useScreenSize";
import useHeaderTitle from "@/hooks/useHeaderTitle";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const { isMobile } = useScreenSize();
  const { headerTitle, showTitle, setShowTitle } = useHeaderTitle();
  const { user } = useAuth();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("newsletter") === "open") {
      setIsSignUpOpen(true);
    }
  }, [location]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY >= 200) {
        setShowTitle(true);
      } else {
        setShowTitle(false);
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [headerTitle, showTitle, setShowTitle]);

  const LanguageButtons = ({ className }: { className?: string }) => (
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

  interface NavLink {
    label: string;
    icon?: JSX.Element;
    path: string;
    sublinks?: { label: string; path: string; shortcut?: string }[];
  }

  const NAV_LINKS: NavLink[] = [
    {
      label: t("header.companies"),
      icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />,
      path: `${currentLanguage}/companies`,
    },
    {
      label: t("header.municipalities"),
      icon: <BarChart3 className="w-4 h-4" aria-hidden="true" />,
      path: `${currentLanguage}/municipalities`,
      sublinks: [
        {
          label: t("header.municipalitiesRanked"),
          path: `${currentLanguage}/municipalities`,
        },
        {
          label: t("header.municipalitiesExplore"),
          path: `${currentLanguage}/municipalities/explore`,
        },
      ],
    },
    {
      label: t("header.products"),
      path: `${currentLanguage}/products`,
    },
    {
      label: t("header.about"),
      path: `${currentLanguage}/about`,
      sublinks: [
        { label: t("header.aboutUs"), path: `${currentLanguage}/about` },
        {
          label: t("header.methodology"),
          path: `${currentLanguage}/methodology?view=general`,
        },
        {
          label: t("header.press"),
          path: "https://www.mynewsdesk.com/se/klimatbyraan/latest_news",
        },
        { label: t("header.support"), path: `${currentLanguage}/support` },
      ],
    },
    {
      path: `${currentLanguage}/articles`,
      label: t("header.insights"),
      sublinks: [
        { label: t("header.reports"), path: `${currentLanguage}/reports` },
        { label: t("header.articles"), path: `${currentLanguage}/articles` },
        { label: t("header.newsletterArchive"), path: `${currentLanguage}/newsletter-archive`},
        { label: t("header.learnMore"), path: `${currentLanguage}/learn-more` },
      ],
    },
  ];

  // Internal links for signed-in users
  const INTERNAL_LINKS = [
    {
      label: "Validation Dashboard",
      path: "/internal-pages/validation-dashboard",
    },
    { label: "Requests Dashboard", path: "/internal-pages/requests-dashboard" },
    { label: "Internal Dashboard", path: "/internal-pages/internal-dashboard" },
    {
      label: "Trend Analysis Dashboard",
      path: "/internal-pages/trend-analysis-dashboard",
    },
  ];

  return (
    <>
      <header className="fixed w-screen overflow-x-hidden overflow-y-hidden top-0 left-0 right-0 z-50 bg-black-2 h-10 lg:h-12">
        <div className="container relative mx-auto px-4 flex items-center justify-between pt-2 lg:pt-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-base font-medium"
          >
            Klimatkollen
          </Link>
          {showTitle && (
            <span className="absolute left-1/2 transform -translate-x-1/2">
              {isMobile && headerTitle}
            </span>
          )}

          <button
            className="lg:hidden text-white"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Menubar className="border-none bg-transparent h-full">
              {NAV_LINKS.map((item) =>
                item.sublinks ? (
                  <MenubarMenu key={item.label}>
                    <MenubarTrigger
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 h-full transition-all text-sm cursor-pointer",
                        location.pathname.startsWith(item.path)
                          ? "bg-black-1 text-white"
                          : "text-grey hover:text-white",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </MenubarTrigger>
                    <MenubarContent>
                      {item.sublinks.map((sublink) => (
                        <MenubarItem key={sublink.path}>
                          {sublink.path.startsWith("https://") ? (
                            <a
                              href={sublink.path}
                              className="flex justify-between w-full"
                              target="_blank"
                              key={sublink.path}
                            >
                              {sublink.label}
                            </a>
                          ) : (
                            <Link
                              to={sublink.path}
                              className="flex justify-between w-full"
                            >
                              {sublink.label}
                              {sublink.shortcut && (
                                <MenubarShortcut>
                                  {sublink.shortcut}
                                </MenubarShortcut>
                              )}
                            </Link>
                          )}
                        </MenubarItem>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-3 h-full text-sm",
                      matchPath(item.path, location.pathname)
                        ? "bg-black-1 text-white"
                        : "text-grey hover:text-white",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ),
              )}
              {user && (
                <MenubarMenu>
                  <MenubarTrigger className="flex items-center gap-2 px-3 py-3 h-full transition-all text-sm cursor-pointer text-grey hover:text-white">
                    <span>Internal</span>
                    <ChevronDown className="w-4 h-4" />
                  </MenubarTrigger>
                  <MenubarContent>
                    {INTERNAL_LINKS.map((link) => (
                      <MenubarItem key={link.path}>
                        <Link
                          to={link.path}
                          className="flex justify-between w-full"
                        >
                          {link.label}
                        </Link>
                      </MenubarItem>
                    ))}
                  </MenubarContent>
                </MenubarMenu>
              )}
              <div className="ml-4 h-full flex items-center">
                <HeaderSearchButton className="mx-2" />
                <LanguageButtons className={"hidden md:flex mx-4 "} />
                <NewsletterPopover
                  isOpen={isSignUpOpen}
                  onOpenChange={setIsSignUpOpen}
                  buttonText={t("header.newsletter")}
                />
              </div>
            </Menubar>
          </nav>

          {/* Mobile Fullscreen Menu */}
          {menuOpen && (
            <div className="fixed inset-0 w-full h-full z-100 flex p-8 mt-10 bg-black-2">
              <div className="flex flex-col gap-6 text-lg w-full">
                <HeaderSearchButton
                  className="w-full"
                  onSearchResultClick={toggleMenu}
                />
                <LanguageButtons />
                {NAV_LINKS.map((link) => (
                  <div key={link.path} className="flex flex-col">
                    <Link
                      to={link.path}
                      onClick={toggleMenu}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                    {link.sublinks && (
                      <div className="flex flex-col gap-2 pl-4 mt-2">
                        {link.sublinks.map((sublink) =>
                          sublink.path.startsWith("https://") ? (
                            <a
                              href={sublink.path}
                              className="flex items-center gap-2 text-sm text-gray-400"
                              target="_blank"
                              key={sublink.path}
                              onClick={toggleMenu}
                            >
                              {sublink.label}
                            </a>
                          ) : (
                            <Link
                              key={sublink.path}
                              to={sublink.path}
                              onClick={toggleMenu}
                              className="flex items-center gap-2 text-sm text-gray-400"
                            >
                              {sublink.label}
                            </Link>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Newsletter button in mobile menu */}
                <button
                  onClick={() => {
                    setMenuOpen(false); // Close the menu
                    setIsSignUpOpen(true); // Open the newsletter popover
                  }}
                  className="flex items-center gap-2 text-blue-3"
                >
                  <Mail className="w-4 h-4" />
                  {t("header.newsletter")}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
