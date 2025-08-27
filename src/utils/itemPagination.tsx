interface ItemPaginationProps<T> {
  content: T[];
  itemsPerPage?: number;
}

export type Page<T> = {
  items: T[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function itemPagination<T>({
  content,
  itemsPerPage = 5,
}: ItemPaginationProps<T>) {
  const totalItems = content.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedContent: Record<string, Page<T>> = {};

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const populatedPage = content.slice(startIndex, endIndex);

    paginatedContent["page" + (i + 1)] = {
      items: populatedPage,
      hasPreviousPage: i !== 0,
      hasNextPage: i !== totalPages - 1,
    };
  }

  return paginatedContent;
}

export default itemPagination;
