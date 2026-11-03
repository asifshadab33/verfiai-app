export async function checkWayback(url: string) {
  const response = await fetch(
    `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`,
  );
  if (!response.ok) throw new Error("Archive.org API request failed.");
  return response.json();
}
