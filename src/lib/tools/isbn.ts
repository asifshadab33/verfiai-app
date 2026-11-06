import { readSessionCache, writeSessionCache } from "./session-cache";

export async function lookupIsbn(isbn: string) {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, "");
  const key = `openlibrary:${cleanIsbn}`;
  const cached = readSessionCache<unknown>(key);
  if (cached !== undefined) return cached;
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`,
  );
  if (response.status === 429 || response.status >= 500)
    throw new Error("OpenLibrary service is temporarily busy. Please try again shortly.");
  if (!response.ok) throw new Error("OpenLibrary request failed.");
  const data = await response.json();
  writeSessionCache(key, data);
  return data;
}
