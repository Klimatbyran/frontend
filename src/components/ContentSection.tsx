import React from 'react';
import { Text } from "@/components/ui/text";

interface ContentSectionProps {
    title: string;
    children: React.ReactNode;
}

const Title = ({ title }: { title: string }) => {
    return <Text className="text-2xl font-bold text-blue-2">{title}</Text>
};

export const ContentSection: React.FC<ContentSectionProps> = ({ title, children }: ContentSectionProps) => {
    return (
        <div className="space-y-4">
            <Title title={title} />
            {children}
        </div>
    );
}
