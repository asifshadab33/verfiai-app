export function generatePassword(
  length: number,
  options: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean },
): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let charset = "";
  if (options.upper) charset += upper;
  if (options.lower) charset += lower;
  if (options.numbers) charset += numbers;
  if (options.symbols) charset += symbols;
  if (!charset) return "";

  let password = "";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) password += charset[values[i] % charset.length];
  return password;
}
