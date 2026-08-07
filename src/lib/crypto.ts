import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION_PREFIX = "v1:";

function getKey(): Buffer {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in environment variables.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string for storage. Format: v1:<ivHex>:<authTagHex>:<cipherHex>
 * Empty/null input is passed through untouched (no ciphertext for empty fields).
 */
export function encryptField(plaintext: string | null | undefined): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${VERSION_PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/** True if the value looks like it was produced by encryptField(). */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(VERSION_PREFIX);
}

/**
 * Decrypts a value produced by encryptField(). If the value is not in the
 * expected encrypted format (e.g. legacy plaintext rows not yet migrated),
 * it is returned unchanged so display code never breaks.
 */
export function decryptField(value: string | null | undefined): string {
  if (!value) return "";
  if (!isEncrypted(value)) return value;
  try {
    const [, ivHex, authTagHex, dataHex] = value.split(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("[crypto] Falha ao descriptografar campo:", err);
    return "";
  }
}
