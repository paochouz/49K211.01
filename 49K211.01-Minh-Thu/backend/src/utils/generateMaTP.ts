export function formatTrangPhucCode(nextNumber: number): string {
  return `TP${String(nextNumber).padStart(6, "0")}`;
}