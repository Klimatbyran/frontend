import { useTranslation } from "react-i18next";
import { Text } from "../ui/text";
import { partners } from "@/lib/constants/footer";

export const PartnersSection = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-black w-full flex flex-col items-center pt-44 md:pt-52 pb-24">
      <div className="w-full container mx-auto px-4 items-center flex flex-col gap-6">
        <Text className="text-center tracking-tight text-4xl font-light">
          {t("landingPage.partnersSection.title")}
        </Text>

        <div className="grid w-full max-w-6xl grid-cols-4 gap-2 sm:gap-3 md:grid-cols-5 lg:grid-cols-10">
          {partners.map((logo) => (
            <a
              key={logo.href}
              href={logo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-16 items-center justify-center rounded-md bg-black-2 px-2 transition-colors hover:bg-black-1 sm:h-20 sm:px-3"
            >
              <span className="flex h-12 w-full items-center justify-center sm:h-10">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="max-h-full max-w-full object-contain opacity-90 transition-opacity group-hover:opacity-100"
                  loading="lazy"
                />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
