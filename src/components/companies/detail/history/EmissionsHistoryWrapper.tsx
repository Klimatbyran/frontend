import { FC } from "react";
import { EmissionsHistoryNew } from "./EmissionsHistory-New";
import { EmissionsHistoryProps } from "@/types/emissions";

interface EmissionsHistoryWrapperProps extends EmissionsHistoryProps {
  className?: string;
}

export const EmissionsHistoryWrapper: FC<EmissionsHistoryWrapperProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={className}>
      <EmissionsHistoryNew {...props} />
    </div>
  );
};
