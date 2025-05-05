import { useAuth } from "@/contexts/AuthContext";
import { socialLinks, partners } from "../../lib/constants/footer";
import { Text } from "@/components/ui/text";
import { Trans, useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useNavigate } from "react-router-dom";
import { Marquee } from "@/components/magicui/marquee.tsx";

function SocialLinks() {
  return (
    <div className="flex gap-2 md:gap-4 justify-center">
      {socialLinks.map(({ href, icon: Icon, title }) => (
        <a
          key={title}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 md:p-3 bg-black-1 rounded-full hover:bg-black-1/80 transition-colors"
          title={title}
        >
          {typeof Icon === "string" ? (
            <img src={Icon} alt={title} className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <Icon className="w-5 h-5 md:w-6 md:h-6" aria-label={title} />
          )}
        </a>
      ))}
    </div>
  );
}

function PartnerLogos() {
  return (
    <Marquee reverse={false} pauseOnHover={false} className="[--duration:60s]">
      {partners.map(({ href, src, alt }) => (
        <a
          key={alt}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center"
        >
          <img className="w-28 max-h-12 object-contain" src={src} alt={alt} />
        </a>
      ))}
    </Marquee>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const { login, logout, token, user } = useAuth();
  const navigate = useNavigate();

  return (
    <footer className="relative w-full z-20 bg-black-2 py-4 md:py-8">
      <div className="container mx-auto px-4 space-y-4 md:space-y-8 flex flex-col w-screen items-center text-center">
        {/* Contact Section */}
        <div className="space-y-2 md:space-y-4">
          <Text variant="h6" className="text-grey md:text-base">
            {t("footer.contactUs")}
          </Text>
          <SocialLinks />
          <div className="text-sm md:text-base max-w-full md:max-w-2xl font-light text-grey">
            <Trans
              i18nKey="footer.description"
              components={[
                <a
                  title="Klimatkollen's Github"
                  className="underline hover:text-white transition-colors"
                  href="https://github.com/Klimatbyran/"
                  target="_blank"
                  rel="noopener noreferrer"
                />,
              ]}
            />
          </div>
        </div>

        {/* Partners Section */}
        <div className="space-y-2 relative">
          <Text variant="h6" className="text-blue-3">
            {t("footer.supporters")}
          </Text>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--black-2)] to-transparent pointer-events-none z-10" />
          <PartnerLogos />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--black-2)] to-transparent pointer-events-none z-10" />
        </div>

        {/* Footer Links */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-grey items-center">
          <a href="/privacy" className="hover:text-white transition-colors">
            {t("footer.privacyTerms")}
          </a>
          <a href="/license" className="hover:text-white transition-colors">
            {t("footer.internationalLicense")}
          </a>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            className="hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("footer.ccBySa")}
          </a>
          {!token && (
            <a
              onClick={() => login()}
              className="hover:text-white transition-colors cursor-pointer"
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
              className="hover:text-white cursor-pointer transition-colors"
            >
              {t("footer.logout")}
            </a>
          )}
          {token && user && (
            <div className="hover:text-white ms-auto flex items-center">
              <span>
                {t("footer.welcome")}, {user?.name ?? ""}
              </span>
              <Avatar className="flex-shrink-0 ms-1">
                <AvatarImage
                  className="w-[45px] h-[45px] border border-grey rounded-full"
                  src={user.githubImageUrl || ""}
                />
                <AvatarFallback>{user?.name ?? ""}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
