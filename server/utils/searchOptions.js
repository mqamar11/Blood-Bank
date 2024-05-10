const { resolveQueryOptions } = require("@utils");
class SearchOptions {
  limit;
  skip;
  sort;

  constructor(query) {
    const { sort, pageSize, skip } = resolveQueryOptions(query);

    // Pagination
    this.limit = pageSize;
    this.skip = skip;

    // Sorting
    this.sort = sort;
  }
}

module.exports = SearchOptions;
