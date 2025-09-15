import { FC, useState } from "react";
import { EmissionsHistory } from "./EmissionsHistory";
import { EmissionsHistoryNew } from "./EmissionsHistory-New";
import { EmissionsHistoryProps } from "@/types/emissions";
import { Button } from "@/components/ui/button";

interface EmissionsHistoryWrapperProps extends EmissionsHistoryProps {
  className?: string;
}

export const EmissionsHistoryWrapper: FC<EmissionsHistoryWrapperProps> = ({
  className,
  ...props
}) => {
  const [showNewVersion, setShowNewVersion] = useState(true);

  return (
    <div className={className}>
      {/* Version Toggle */}
      <div className="flex justify-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewVersion(!showNewVersion)}
          className="bg-black-2 border-black-1 text-white hover:bg-black-1"
        >
          {showNewVersion ? "Show Original Version" : "Show New Version"}
        </Button>
      </div>

      {/* Chart Display */}
      {showNewVersion ? (
        <EmissionsHistoryNew {...props} />
      ) : (
        <EmissionsHistory {...props} />
      )}
    </div>
  );
};
