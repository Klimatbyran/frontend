// MethodsParisStatusSection.tsx
import { useTranslation } from "react-i18next";
import { MethodSection } from "@/components/layout/MethodSection";

export const InterpretingOnTrackContent = () => {
  const { t } = useTranslation();

  return (
    <div className="prose prose-invert mx-auto space-y-6">
      <p>{t("methodsPage.general.interpretingOnTrack.paragraph1")}</p>

      <blockquote className="border-l-2 border-blue-2 pl-4 italic">
        {t("methodsPage.general.interpretingOnTrack.question")}
      </blockquote>

      <p>{t("methodsPage.general.interpretingOnTrack.paragraph2")}</p>

      <MethodSection
        title={t("methodsPage.general.interpretingOnTrack.statuses.title")}
      >
        {/* On Track */}
        <p className="font-semibold">
          {t("methodsPage.general.interpretingOnTrack.statuses.onTrack.title")}
        </p>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.onTrack.paragraph1",
          )}
        </p>
        <ul className="list-disc list-outside ml-6">
          <li>
            {t(
              "methodsPage.general.interpretingOnTrack.statuses.onTrack.point1",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.interpretingOnTrack.statuses.onTrack.point2",
            )}
          </li>
        </ul>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.onTrack.paragraph2",
          )}
        </p>

        {/* Not On Track */}
        <p className="font-semibold mt-4">
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.notOnTrack.title",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.notOnTrack.paragraph1",
          )}
        </p>
        <ul className="list-disc list-outside ml-6">
          <li>
            {t(
              "methodsPage.general.interpretingOnTrack.statuses.notOnTrack.point1",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.interpretingOnTrack.statuses.notOnTrack.point2",
            )}
          </li>
        </ul>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.notOnTrack.paragraph2",
          )}
        </p>

        {/* No Assessment */}
        <p className="font-semibold mt-4">
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.noAssessment.title",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.noAssessment.paragraph1",
          )}
        </p>
        <ul className="list-disc list-outside ml-6">
          <li>
            {t(
              "methodsPage.general.interpretingOnTrack.statuses.noAssessment.point1",
            )}
          </li>
          <li>
            {t(
              "methodsPage.general.interpretingOnTrack.statuses.noAssessment.point2",
            )}
          </li>
        </ul>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.statuses.noAssessment.paragraph2",
          )}
        </p>
      </MethodSection>

      <MethodSection
        title={t("methodsPage.general.interpretingOnTrack.scope.title")}
      >
        <p>{t("methodsPage.general.interpretingOnTrack.scope.paragraph1")}</p>

        <p className="font-semibold">
          {t("methodsPage.general.interpretingOnTrack.scope.doesTitle")}
        </p>
        <ul className="list-disc list-outside ml-6">
          <li>
            {t("methodsPage.general.interpretingOnTrack.scope.does.point1")}
          </li>
          <li>
            {t("methodsPage.general.interpretingOnTrack.scope.does.point2")}
          </li>
          <li>
            {t("methodsPage.general.interpretingOnTrack.scope.does.point3")}
          </li>
        </ul>

        <p className="font-semibold mt-3">
          {t("methodsPage.general.interpretingOnTrack.scope.doesNotTitle")}
        </p>
        <ul className="list-disc list-outside ml-6">
          <li>
            {t("methodsPage.general.interpretingOnTrack.scope.doesNot.point1")}
          </li>
          <li>
            {t("methodsPage.general.interpretingOnTrack.scope.doesNot.point2")}
          </li>
          <li>
            {t("methodsPage.general.interpretingOnTrack.scope.doesNot.point3")}
          </li>
          <li>
            {t("methodsPage.general.interpretingOnTrack.scope.doesNot.point4")}
          </li>
        </ul>

        <p>{t("methodsPage.general.interpretingOnTrack.scope.paragraph2")}</p>
      </MethodSection>

      <MethodSection
        title={t("methodsPage.general.interpretingOnTrack.changes.title")}
      >
        <p>{t("methodsPage.general.interpretingOnTrack.changes.paragraph1")}</p>
        <ul className="list-disc list-outside ml-6">
          <li>{t("methodsPage.general.interpretingOnTrack.changes.point1")}</li>
          <li>{t("methodsPage.general.interpretingOnTrack.changes.point2")}</li>
          <li>{t("methodsPage.general.interpretingOnTrack.changes.point3")}</li>
          <li>{t("methodsPage.general.interpretingOnTrack.changes.point4")}</li>
        </ul>
        <p>{t("methodsPage.general.interpretingOnTrack.changes.paragraph2")}</p>
      </MethodSection>
      <MethodSection
        title={t(
          "methodsPage.general.interpretingOnTrack.historicVsParis.title",
        )}
      >
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.historicVsParis.paragraph1",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.historicVsParis.paragraph2",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.historicVsParis.paragraph3",
          )}
        </p>
        <p>
          {t(
            "methodsPage.general.interpretingOnTrack.historicVsParis.paragraph4",
          )}
        </p>
      </MethodSection>
    </div>
  );
};
