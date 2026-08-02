// Web Crypto API AES-GCM helper for FoxStock keys encryption

async function getKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Use a fixed salt for deterministic profile key generation
  const salt = enc.encode("foxstock_salt_99812");
  
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(text, secret) {
  if (!text) return "";
  try {
    const enc = new TextEncoder();
    const key = await getKey(secret);
    
    // Generate a random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      enc.encode(text)
    );

    // Combine IV and Ciphertext
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to Hex
    return Array.from(combined)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (err) {
    console.error("Encryption failed:", err);
    return "";
  }
}

export async function decryptText(hex, secret) {
  if (!hex) return "";
  try {
    const key = await getKey(secret);
    
    // Parse Hex
    const match = hex.match(/.{1,2}/g);
    if (!match) return "";
    const bytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.warn("Decryption failed (possibly invalid key/corrupted data):", err);
    return "";
  }
}
