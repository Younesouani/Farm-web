import aesjs from 'aes-js';

const getSecretKey = (): number[] => {
  const keyStr = (process.env.ENCRYPTION_KEY || '12345678901234567890123456789012').padEnd(32, '0').slice(0, 32);
  return Array.from(aesjs.utils.utf8.toBytes(keyStr));
};

/**
 * Encrypts a plain text string using AES-256 CTR mode.
 */
export function encryptPII(textVal: string): string {
  if (!textVal) return textVal;
  try {
    const textBytes = aesjs.utils.utf8.toBytes(textVal);
    const aesCtr = new aesjs.ModeOfOperation.ctr(getSecretKey(), new aesjs.Counter(5));
    const encryptedBytes = aesCtr.encrypt(textBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  } catch (err) {
    console.error('Encryption error:', err);
    return textVal;
  }
}

/**
 * Decrypts an AES-256 encrypted hex string back to plain text.
 */
export function decryptPII(hexVal: string): string {
  if (!hexVal) return hexVal;
  try {
    const encryptedBytes = aesjs.utils.hex.toBytes(hexVal);
    const aesCtr = new aesjs.ModeOfOperation.ctr(getSecretKey(), new aesjs.Counter(5));
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  } catch (err) {
    console.error('Decryption error:', err);
    return hexVal;
  }
}

// Aliases to support components importing either function naming pattern
export const encrypt = encryptPII;
export const decrypt = decryptPII;
