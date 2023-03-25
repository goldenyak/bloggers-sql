export class Pagination {
  static getPaginationDataForUser(query) {
    const pageNumber = typeof query.pageNumber === 'string' ? +query.pageNumber : 1;
    const pageSize = typeof query.pageSize === 'string' ? +query.pageSize : 10;
    const searchLoginTerm =
      typeof query.searchLoginTerm === 'string' ? query.searchLoginTerm : '';
    const searchEmailTerm =
      typeof query.searchEmailTerm === 'string' ? query.searchEmailTerm : '';
    const sortBy =
      typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
    const banStatus =
      query.banStatus === 'banned'
        ? 'banned'
        : query.banStatus === 'notBanned'
          ? 'notBanned'
          : [true, false];
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return {
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      banStatus,
    };
  }
  static getPaginationDataForBlogs(query) {
    const pageNumber = typeof query.pageNumber === 'string' ? +query.pageNumber : 1;
    const pageSize = typeof query.pageSize === 'string' ? +query.pageSize : 10;
    const searchNameTerm =
      typeof query.searchLoginTerm === 'string' ? query.searchLoginTerm : '';
    const sortBy =
      typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return {
      pageNumber,
      pageSize,
      searchNameTerm,
      sortBy,
      sortDirection,
    };
  }
  static getPaginationDataForPosts(query) {
    const pageNumber = typeof query.pageNumber === 'string' ? +query.pageNumber : 1;
    const pageSize = typeof query.pageSize === 'string' ? +query.pageSize : 10;
    const sortBy =
      typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    };
  }
  static getPaginationDataForBannedUsers(query) {
    const pageNumber = typeof query.pageNumber === 'string' ? +query.pageNumber : 1;
    const pageSize = typeof query.pageSize === 'string' ? +query.pageSize : 10;
    const searchLoginTerm =
      typeof query.searchLoginTerm === 'string' ? query.searchLoginTerm : '';
    const sortBy =
      typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return {
      pageNumber,
      pageSize,
      searchLoginTerm,
      sortBy,
      sortDirection,
    };
  }
}
