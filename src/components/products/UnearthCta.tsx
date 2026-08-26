import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const UNEARTH_CONTACT_EMAIL = "hello@unearthdata.ai";

export function UnearthCta() {
  const { t } = useTranslation();
  const mailtoUrl = `mailto:${UNEARTH_CONTACT_EMAIL}?subject=${encodeURIComponent(
    t("dataDownloadPage.unearthCta.emailSubject"),
  )}`;

  return (
    <section className="mb-16 rounded-level-1 bg-black-2 p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="min-w-0">
          <img
            src="/logos/unearth-white.png"
            alt="Unearth"
            width={120}
            height={28}
            className="mb-5 h-4 w-auto"
          />
          <h2 className="text-xl font-medium leading-tight text-white sm:text-2xl">
            {t("dataDownloadPage.unearthCta.title")}
          </h2>
          <p className="mt-4 max-w-3xl text-grey">
            {t("dataDownloadPage.unearthCta.body")}
          </p>
        </div>
        <div className="flex shrink-0">
          <a
            href={mailtoUrl}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-4 md:w-auto"
          >
            {t("dataDownloadPage.unearthCta.action")}
            <Mail className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
