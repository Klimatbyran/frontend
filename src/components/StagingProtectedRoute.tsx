import { Outlet } from "react-router-dom";
import { stagingFeatureFlagEnabled } from "@/utils/ui/featureFlags";
import { NotFoundPage } from "@/pages/NotFoundPage";

const StagingProtectedRoute = () => {
  const isStaging = stagingFeatureFlagEnabled();

  if (!isStaging) {
    return <NotFoundPage />;
  }

  return <Outlet />;
};

export default StagingProtectedRoute;
