export class CursorPaginationEntity {
  nextPage: string = '';
  previousPage: string = '';
  nextCursor: string = '';
  previousCursor: string = '';

  constructor(nextCursor: string, previousCursor: string, fullUrl: string) {
    if (nextCursor || previousCursor) {
      const url = new URL(fullUrl);
      const baseUrl = url.origin + url.pathname;

      if (nextCursor) {
        url.searchParams.delete('before');
        url.searchParams.set('after', nextCursor);
        this.nextPage = `${baseUrl}?${url.searchParams.toString()}`;
        this.nextCursor = nextCursor;
      }
      if (previousCursor) {
        url.searchParams.delete('after');
        url.searchParams.set('before', previousCursor);
        this.previousPage = `${baseUrl}?${url.searchParams.toString()}`;
        this.previousCursor = previousCursor;
      }
    }
  }
}
