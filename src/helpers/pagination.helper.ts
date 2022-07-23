type PaginationOptions = {
  limit: number;
  skip: number;
  sort: string;
};

export const getPaginationOptions = (query: any): PaginationOptions => {
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = query.skip ? Number(query.skip) : 0;
  const sort = query.sort ? query.sort : "-updatedAt";
  return { limit, skip, sort };
};

export const getMatch = (query: any): any => {
  const match: any = {};
  const keys: string[] = Object.keys(query);
  const filteredKeys: string[] = keys.filter((key) => {
    return key !== "sort" && key !== "skip" && key !== "limit";
  });
  filteredKeys.forEach((key) => {
    if (!isNaN(Number(query[key]))) {
      query[key] = Number(query[key]);
    } else if (query[key] === "true" || query[key] === "false") {
      if (query[key] === "true") {
        query[key] = true;
      } else {
        query[key] = false;
      }
    } else if (query[key] === "null") {
      query[key] = null;
    }
    return (match[key] = query[key]);
  });
  return match;
};

export const getFilteredMatch = (match: any, allowedProperties: string[]) => {
  const filteredMatch: any = {};
  const filteredKeys: string[] = Object.keys(match).filter((key) =>
    allowedProperties.includes(key)
  );
  if (!filteredKeys.length) {
    return filteredMatch;
  }
  filteredKeys.forEach((key) => {
    filteredMatch[key] = match[key];
  });
  return filteredMatch;
};
