/**
 * Security utilities using standard Web Crypto API (100% on-device, zero-cloud)
 */

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Hashes a 4-digit PIN with a random cryptographic salt using SHA-256.
 */
export async function hashPin(pin: string, existingSalt?: string): Promise<{ hash: string; salt: string }> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API is not supported in this browser");
  }

  const salt = existingSalt || bufferToHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + ":" + pin.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hash = bufferToHex(hashBuffer);

  return { hash, salt };
}

/**
 * Verifies if entered PIN matches the stored hash and salt.
 */
export async function verifyPin(pin: string, storedHash: string, salt: string): Promise<boolean> {
  try {
    const { hash } = await hashPin(pin, salt);
    return hash === storedHash;
  } catch {
    return false;
  }
}

/**
 * Encrypts arbitrary text (e.g. JSON vault backup) using PBKDF2 + AES-GCM 256.
 */
export async function encryptVault(plainJson: string, password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API is not supported in this browser");
  }

  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Import raw password
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Derive AES-GCM key
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  // Encrypt ciphertext
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoder.encode(plainJson)
  );

  const payload = {
    version: 1,
    format: "nestsave-encrypted-vault",
    salt: bufferToHex(salt.buffer),
    iv: bufferToHex(iv.buffer),
    ciphertext: bufferToHex(encryptedBuffer)
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Decrypts an AES-GCM encrypted vault backup with user password.
 */
export async function decryptVault(encryptedJsonString: string, password: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API is not supported in this browser");
  }

  const payload = JSON.parse(encryptedJsonString);
  if (payload.format !== "nestsave-encrypted-vault" || !payload.salt || !payload.iv || !payload.ciphertext) {
    throw new Error("Invalid or corrupted NestSave encrypted file format.");
  }

  const salt = hexToBuffer(payload.salt);
  const iv = hexToBuffer(payload.iv);
  const ciphertext = hexToBuffer(payload.ciphertext);

  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      aesKey,
      ciphertext as unknown as BufferSource
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    throw new Error("Incorrect password or corrupted backup file.");
  }
}
