export function urlToQueryParams(url: string) {
  if (!url) return {};

  const searchParams = new URL(url).searchParams;
  const queryParams: { [key: string]: string | string[] } = {};

  searchParams.forEach((value, key) => {
    if (queryParams[key]) {
      // If the key already exists, it means there are multiple values for this key
      if (Array.isArray(queryParams[key])) {
        (queryParams[key] as string[]).push(value);
      } else {
        queryParams[key] = [queryParams[key] as string, value];
      }
    } else {
      queryParams[key] = value;
    }
  });

  return queryParams;
}
