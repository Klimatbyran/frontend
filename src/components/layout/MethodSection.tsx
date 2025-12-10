import { Text } from "@/components/ui/text";

interface MethodSectionProps {
  title: string;
  children: React.ReactNode;
}

export const MethodSection = ({ title, children }: MethodSectionProps) => {
  return (
    <div className="space-y-4">
      <Text className="text-blue-2 font-bold text-2xl">{title}</Text>
      {children}
    </div>
  );
};
