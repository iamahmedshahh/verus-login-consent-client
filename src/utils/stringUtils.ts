export function capitalizeString(s: string) {
  const firstChar = s.charAt(0).toUpperCase();
  return firstChar + s.slice(1);
}
