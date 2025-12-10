import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Text } from "@/components/ui/text";

interface AccordionGroupProps {
  title: string;
  children: React.ReactNode;
  value: string;
}

export function AccordionGroup({
  title,
  children,
  value,
}: AccordionGroupProps) {
  return (
    <AccordionItem value={value} className="border-none">
      <AccordionTrigger className="dark:bg-black-2 bg-white rounded-level-2 p-8 hover:no-underline dark:hover:bg-black-1 hover:bg-grey/10 data-[state=open]:dark:bg-black-1 data-[state=open]:bg-grey/10">
        <Text variant="h4" className="dark:text-white text-black-3">
          {title}
        </Text>
      </AccordionTrigger>
      <AccordionContent className="p-4 md:p-8">{children}</AccordionContent>
    </AccordionItem>
  );
}
