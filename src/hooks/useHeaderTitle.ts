import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useCompanyDetails } from "./companies/useCompanyDetails";
import { useMunicipalityDetails } from "./municipalities/useMunicipalityDetails";
const NON_ID_ROUTES = new Set([
  "sectors",
  "ranked",
  "explore",
  "edit",
  "articles",
  "reports",
  "about",
  "methodology",
  "support",
]);

const useHeaderTitle = () => {
  const [showTitle, setShowTitle] = useState(false);
  const location = useLocation();
  const params = useParams<{ id?: string }>();

  const id = params.id;
  const isDetailsPage = !!id && !NON_ID_ROUTES.has(id);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isCompanyPage = pathSegments.includes("companies") && isDetailsPage;
  const isMunicipalityPage =
    pathSegments.includes("municipalities") && isDetailsPage;

  const viewedCompany = useCompanyDetails(isCompanyPage ? id! : "");
  const viewedMunicipality = useMunicipalityDetails(
    isMunicipalityPage ? id! : "",
  );

  const headerTitle = isCompanyPage
    ? viewedCompany.company?.name
    : isMunicipalityPage
      ? viewedMunicipality.municipality?.name
      : undefined;

  return { headerTitle, showTitle, setShowTitle };
};

export default useHeaderTitle;
