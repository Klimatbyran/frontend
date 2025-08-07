import { useState, useEffect } from "react";
import { useScreenSize } from "@/hooks/useScreenSize";
import { NewsletterType } from "@/lib/newsletterArchive/newsletterData";
import { useNavigate } from "react-router-dom";
import itemPagination from "@/utils/itemPagination";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

interface NewsletterNavigationProps {
  newsletterList: Array<NewsletterType>;
  setDisplayedNewsletter: (newsletter: NewsletterType) => void;
  displayedNewsLetter: NewsletterType;
}

export function NewsletterNavigation({
  newsletterList,
  displayedNewsLetter,
  setDisplayedNewsletter,
}: NewsletterNavigationProps) {
  const { isMobile } = useScreenSize();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginatedContent, setPaginatedContent] = useState<Record<
    string,
    NewsletterType[]
  > | null>(null);

  useEffect(() => {
    if (newsletterList) {
      const paginatedItems = itemPagination({
        content: newsletterList,
      });
      if (paginatedItems) {
        setPaginatedContent(paginatedItems);
      }
    }
  }, [newsletterList]);

  return (
    <>
      {paginatedContent && (
        <Pagination
          className={`${isMobile ? "h-[575px] p-2" : "h-[585px] p-2"} flex flex-col bg-black-2 rounded-md lg:max-w-[280px] justify-between`}
        >
          <PaginationContent
            className={`${isMobile ? "min-h-[300px]" : "h-3/4"} flex flex-col divide-y divide-black-1 items-baseline text-left`}
          >
            {paginatedContent &&
              paginatedContent["page" + currentPage].map((item, index) => {
                return (
                  <PaginationLink
                    key={index}
                    className={`
                      ${displayedNewsLetter === item.long_archive_url ? "bg-black-1" : null}
                      ${isMobile ? "max-h-[100px]" : "max-h-[125px]"}
                       flex flex-col h-full gap-[5px] w-full p-3 my-1 text-left items-start text-sm font-medium text-grey hover:bg-black-1 transition-colors cursor-pointer duration-200 rounded-lg`}
                    onClick={() => {
                      setDisplayedNewsletter?.(item.long_archive_url);
                      navigate(`?view=${item.id}`);
                    }}
                  >
                    <span
                      className="flex text-sm font-medium text-white
"
                    >
                      {item.send_time.slice(0, item.send_time.indexOf("T"))}
                    </span>
                    {item.settings.subject_line}
                  </PaginationLink>
                );
              })}
          </PaginationContent>
          <div className="flex justify-center mt-4">
            {paginatedContent["page" + currentPage].hasPreviousPage && (
              <PaginationPrevious
                onClick={() => setCurrentPage(currentPage - 1)}
              />
            )}
            {paginatedContent["page" + currentPage].hasNextPage && (
              <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
            )}
          </div>
        </Pagination>
      )}
    </>
  );
}
