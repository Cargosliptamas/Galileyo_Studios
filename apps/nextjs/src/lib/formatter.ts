export function formatCardNumber(number?: string) {
  if (!number) {
    return null;
  }

  return number
    .slice(-4)
    .padStart(16, "*")
    .replace(/(.{4})/g, "$1 ");
}
