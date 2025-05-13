import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SupportMethodProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[] | Record<string, string> | { [key: string]: any };
  action?: {
    text: string;
    link: string;
  };
  readMore?: {
    text: string;
    content: {
      header: string;
      intro: string[];
      benefitsHeader: string;
      benefits: string[];
      cost: string;
    };
  };
}

export function SupportMethod({
  icon,
  title,
  description,
  details,
  action,
  readMore,
}: SupportMethodProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const detailsArray = Array.isArray(details)
    ? details
    : Object.values(details);

  return (
    <>
      <div className="bg-black-2 rounded-level-1 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-black-1 rounded-full">{icon}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-grey mb-4">{description}</p>
            <ul className="space-y-2 mb-4">
              {detailsArray.map((detail, index) => (
                <li key={index} className="flex items-center gap-2 text-grey">
                  <span className="w-1.5 h-1.5 bg-blue-3 rounded-full" />
                  {detail}
                </li>
              ))}
            </ul>
            <div className="flex gap-4">
              {action && (
                <a
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-black-1 hover:bg-blue-3 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  {action.text}
                </a>
              )}
              {readMore && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-block bg-blue-5 hover:bg-blue-3 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  {readMore.text}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-black-2 max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-white">{title}</DialogTitle>
          {readMore?.content ? (
            <div className="text-grey mt-2">
              <h3 className="text-xl font-bold text-white mb-4">
                {readMore.content.header}
              </h3>
              {readMore.content.intro.map((para, i) => (
                <p className="mb-3" key={i}>
                  {para}
                </p>
              ))}
              <div className="font-semibold text-white mb-2">
                {readMore.content.benefitsHeader}
              </div>
              <ul className="list-disc pl-6 mb-3">
                {readMore.content.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <p className="mt-4 font-bold text-white">
                {readMore.content.cost}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
