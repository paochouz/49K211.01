/** Frontend status <-> DB status */
export const ORDER_STATUS_TO_DB: Record<string, string> = {
  "Chưa cọc đơn": "Chua coc",
  "Đang thuê": "Dang thue",
  "Đã trả": "Da tra",
  "Trễ hạn": "Tre han",
};

export const ORDER_STATUS_FROM_DB: Record<string, string> = {
  "Chua coc": "Chưa cọc đơn",
  "Dang thue": "Đang thuê",
  "Da tra": "Đã trả",
  "Tre han": "Trễ hạn",
};

export function mapStatusToDb(frontendStatus: string): string | null {
  if (!frontendStatus) return null;

  const raw = frontendStatus.trim();
  if (ORDER_STATUS_TO_DB[raw]) return ORDER_STATUS_TO_DB[raw];

  const normalized = raw.toLowerCase();
  if (normalized === "chua coc" || normalized === "chua-coc") return "Chua coc";
  if (normalized === "dang thue" || normalized === "dang-thue") return "Dang thue";
  if (normalized === "da tra" || normalized === "da-tra") return "Da tra";
  if (normalized === "tre han" || normalized === "tre-han") return "Tre han";

  return null;
}

export function mapStatusFromDb(dbStatus: string): string {
  return ORDER_STATUS_FROM_DB[dbStatus] ?? dbStatus;
}

/** DB: DT000001 -> Frontend: HDT000001 */
export function invoiceNoFromMaDon(maDon: string): string {
  const m = maDon.trim().toUpperCase();
  if (m.startsWith("DT")) return "HDT" + m.slice(2);
  return m;
}

/** Frontend: HDT000001 -> DB: DT000001 */
export function normalizeMaDon(param: string): string {
  const u = param.trim().toUpperCase();
  if (u.startsWith("HDT")) return "DT" + u.slice(3);
  return u;
}

export function formatVnd(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  return `${n.toLocaleString("vi-VN")}đ`;
}

export function parseVnDate(ddMmYyyy: string): Date | null {
  const parts = ddMmYyyy.trim().split("/");
  if (parts.length !== 3) return null;

  const d = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const y = Number(parts[2]);

  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
    return null;
  }

  const dt = new Date(y, m, d);
  if (Number.isNaN(dt.getTime())) return null;

  if (dt.getDate() !== d || dt.getMonth() !== m || dt.getFullYear() !== y) {
    return null;
  }

  return dt;
}

export function formatVnDate(value: Date | string | null | undefined): string {
  if (value == null) return "";

  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}