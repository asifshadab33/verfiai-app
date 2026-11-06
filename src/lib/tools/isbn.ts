export async function lookupIsbn(isbn: string) {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, "");
  const key = `openlibrary:${cleanIsbn}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached !== null) return JSON.parse(cached);
  } catch {
    // Storage can be unavailable or contain a malformed entry; continue the lookup.
  }
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`,
  );
  if (response.status === 429 || response.status >= 500)
    throw new Error("OpenLibrary service is temporarily busy. Please try again shortly.");
  if (!response.ok) throw new Error("OpenLibrary request failed.");
  const data = await response.json();
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Successful lookups remain usable when storage is unavailable.
  }
  return data;
}
