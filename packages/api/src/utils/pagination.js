const MIN_PAGE_LIMIT = 1;
const MIN_PAGE = 0;

/**
 * Oaginate elements, returning the number of elements, number of pages and the elements slice
 *
 * @param {Array<*>} elements List of elements
 * @param {Number} limit Limit of elements in a page
 * @param {Number} page Page number
 */
export function paginateArray(elements, limit, page) {
  const total = elements.length;
  const pageCount = Math.ceil(total / Math.max(limit, MIN_PAGE_LIMIT));
  const elementsSlice = elements.slice(limit * Math.max(page, MIN_PAGE)).slice(0, limit);

  return {
    total,
    pageCount,
    elementsSlice,
  };
}
