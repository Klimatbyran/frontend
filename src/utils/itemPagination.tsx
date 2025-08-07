interface ItemPaginationProps<T> {
  content: T[];
  itemsPerPage?: number;
}

function itemPagination<T>({
  content,
  itemsPerPage = 5,
}: ItemPaginationProps<T>) {
  const totalItems = content.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  let paginatedContent = {};

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const populatedPage = content.slice(startIndex, endIndex);

    populatedPage["hasPreviousPage"] = i !== 0;
    populatedPage["hasNextPage"] = i !== totalPages - 1;

    paginatedContent["page" + (i + 1)] = populatedPage;
  }

  return paginatedContent;
}

export default itemPagination;
