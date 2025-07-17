export const fuzzySearch = (
  needle: string,
  haystack: string,
  caseSensitive = false,
) => {
  const isCaseSensitive = caseSensitive;

  let term = needle;
  let search = haystack;

  if (!isCaseSensitive) {
    term = term.toLowerCase();
    search = search.toLowerCase();
  }

  const hlen = search.length;
  const nlen = term.length;
  if (nlen > hlen) {
    return false;
  }
  if (nlen === hlen) {
    return term === search;
  }
  outer: for (let i = 0, j = 0; i < nlen; i++) {
    const nch = needle.charCodeAt(i);
    while (j < hlen) {
      if (search.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
};
