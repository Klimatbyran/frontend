import { useState } from "react";
import { useCompanyDetails } from "./companies/useCompanyDetails";
import { useMunicipalityDetails } from "./municipalities/useMunicipalityDetails";

const useHeaderTitle = () => {
  const [showTitle, setShowTitle] = useState(false);

  const paramSegments = location.pathname.split("/");
  const viewedItemId = paramSegments.pop() ?? "";
  const isCompanyPage = paramSegments.includes("companies");
  const isMunicipalityPage = paramSegments.includes("municipalities");

  const viewedCompany = useCompanyDetails(isCompanyPage ? viewedItemId : "");
  const viewedMunicipality = useMunicipalityDetails(
    isMunicipalityPage ? viewedItemId : "",
  );

  const headerTitle = isCompanyPage
    ? viewedCompany.company?.name
    : isMunicipalityPage
      ? viewedMunicipality.municipality?.name
      : undefined;

  return { headerTitle, showTitle, setShowTitle };
};

export default useHeaderTitle;
