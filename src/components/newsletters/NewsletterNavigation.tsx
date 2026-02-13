import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NewsletterType } from "@/lib/newsletterArchive/newsletterData";
import itemPagination, { Page } from "@/utils/itemPagination";
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
  displayedNewsLetter: NewsletterType | null;
}

export function NewsletterNavigation({
  newsletterList,
  displayedNewsLetter,
  setDisplayedNewsletter,
}: NewsletterNavigationProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paginatedContent, setPaginatedContent] = useState<Record<
    string,
    Page<NewsletterType>
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
          className={
            "h-[525px] p-2 flex flex-col md:h-[585px] bg-black-2 rounded-md lg:max-w-[280px] justify-between"
          }
        >
          <PaginationContent
            className={
              "min-h-[300px] md: h-3/4 flex flex-col divide-y divide-black-1 items-baseline text-left"
            }
          >
            {paginatedContent &&
              paginatedContent["page" + currentPage].items.map(
                (item, index) => {
                  return (
                    <PaginationLink
                      key={index}
                      className={`
                      ${displayedNewsLetter?.long_archive_url === item.long_archive_url ? "bg-black-1" : null}
                      "min-h-[90px] max-h-[100px]
                       md:max-h-[125px] flex flex-col h-full gap-[5px] w-full p-3 my-1 text-left items-start text-sm font-medium text-grey hover:bg-black-1 transition-colors cursor-pointer duration-200 rounded-lg`}
                      onClick={() => {
                        setDisplayedNewsletter?.(item);
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
                },
              )}
          </PaginationContent>
          <div className="flex justify-center mt-0 md:mt-8">
            {paginatedContent["page" + currentPage].hasPreviousPage && (
              <PaginationPrevious
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {t("newsletterArchivePage.previous")}
              </PaginationPrevious>
            )}
            {paginatedContent["page" + currentPage].hasNextPage && (
              <PaginationNext onClick={() => setCurrentPage(currentPage + 1)}>
                {t("newsletterArchivePage.next")}
              </PaginationNext>
            )}
          </div>
        </Pagination>
      )}
    </>
  );
}
