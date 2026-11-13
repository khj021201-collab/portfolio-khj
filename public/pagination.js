(() => {
  function paginate(items, page, pageSize) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      currentPage,
      totalPages,
      totalItems: items.length,
    };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { paginate };
  if (typeof window !== 'undefined') window.portfolioPaginate = paginate;
})();