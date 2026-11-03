export function unixToDate(unix: number): string {
  return new Date(unix * 1000).toISOString();
}
export function dateToUnix(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}
