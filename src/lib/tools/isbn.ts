export async function lookupIsbn(isbn: string) {
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
  const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
  if (!response.ok) throw new Error('OpenLibrary request failed.');
  return response.json();
}
