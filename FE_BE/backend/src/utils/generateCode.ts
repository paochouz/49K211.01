const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(prefix: string, length = 8): string {
  const normalizedPrefix = prefix.trim().toUpperCase();
  const n = Math.max(4, Math.min(32, Math.floor(length)));

  let body = "";
  for (let i = 0; i < n; i += 1) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }

  return normalizedPrefix ? `${normalizedPrefix}-${body}` : body;
}

