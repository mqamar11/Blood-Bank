class SearchOptions {
  limit;
  skip;
  sort;

  constructor(query) {
    const { limit, page, sortBy = "createdAt:desc" } = query;

    // Pagination
    this.limit = limit ? parseInt(limit) : null;
    this.skip = page && this.limit ? (parseInt(page) - 1) * this.limit : null;

    // Sorting
    this.sort = {};
    const sortStr = sortBy.split(":");
    this.sort[sortStr[0]] = sortStr[1] === "desc" ? -1 : 1;
  }
}

module.exports = SearchOptions;
