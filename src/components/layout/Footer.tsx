import { Trans, useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { socialLinks } from "../../lib/constants/footer";

function SocialLinks() {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:justify-end md:gap-3">
      {socialLinks.map(({ href, icon: Icon, title }) => (
        <a
          key={title}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-11 w-11 items-center justify-center rounded-full bg-black-1 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-black"
          title={title}
        >
          {typeof Icon === "string" ? (
            <img
              src={Icon}
              alt={title}
              className="h-5 w-5 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            />
          ) : (
            <Icon
              className="h-5 w-5 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              aria-label={title}
            />
          )}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const { login, logout, token, user } = useAuth();
  const navigate = useNavigate();

  return (
    <footer className="relative mt-24 md:mt-56 w-full border-t bg-black-2 py-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20"
        aria-hidden="true"
      >
        <div className="h-full w-full bg-gradient-to-b from-white/[0.03] to-transparent" />
      </div>

      <div className="container mx-auto w-full px-4">
        <div className="rounded-2xl p-5 md:p-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10">
            <div className="space-y-3 text-center md:text-left">
              <Text variant="h6" className="text-blue-3 md:text-base">
                {t("footer.contactUs")}
              </Text>
              <div className="mx-auto max-w-2xl text-sm font-light text-grey md:mx-0 md:text-base">
                <Trans
                  i18nKey="footer.description"
                  components={[
                    <a
                      title="Klimatkollen's GitHub"
                      className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                      href="https://github.com/Klimatbyran/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />,
                  ]}
                />
              </div>
            </div>

            <SocialLinks />
          </div>

          {/* Footer Links */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex flex-col items-center gap-4 text-grey md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:justify-start md:text-base">
                <a
                  href="/privacy"
                  className="transition-colors hover:text-white"
                >
                  {t("footer.privacyTerms")}
                </a>
                <a
                  href="https://www.apache.org/licenses/LICENSE-2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                  aria-label="Apache License, Version 2.0"
                >
                  {t("footer.internationalLicense")}
                </a>
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                  aria-label="Creative Commons Attribution-ShareAlike 4.0 International License"
                >
                  {t("footer.ccBySa")}
                </a>
              </div>

              <div className="flex items-center gap-4 text-sm md:text-base">
                {!token && (
                  <a
                    onClick={() => login()}
                    className="cursor-pointer transition-colors hover:text-white"
                  >
                    {t("footer.login")}
                  </a>
                )}
                {token && (
                  <a
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="cursor-pointer transition-colors hover:text-white"
                  >
                    {t("footer.logout")}
                  </a>
                )}
                {token && user && (
                  <div className="flex items-center gap-2 transition-colors hover:text-white">
                    <span>
                      {t("footer.welcome")}, {user?.name ?? ""}
                    </span>
                    <Avatar className="flex-shrink-0">
                      <AvatarImage
                        className="h-9 w-9 rounded-full border border-grey"
                        src={user.githubImageUrl || ""}
                      />
                      <AvatarFallback>{user?.name ?? ""}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
