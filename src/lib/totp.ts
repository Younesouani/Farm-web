import crypto from 'crypto';
import QRCode from 'qrcode';

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(base32: string): Buffer {
  const cleanBase32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleanBase32.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleanBase32[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpSecret(email?: string) {
  const bytes = crypto.randomBytes(20);
  let secret = '';
  for (let i = 0; i < 20; i++) {
    secret += BASE32_CHARS[bytes[i] % 32];
  }
  return { secret };
}

export async function generateQrCodeUrl(otpauthUrl: string): Promise<string> {
  return await QRCode.toDataURL(otpauthUrl);
}

/**
 * Calculates RFC 6238 TOTP token for a given counter value and secret.
 */
export function calculateTotpToken(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  
  buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buffer.writeUInt32BE(counter % 0x100000000, 4);

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

/**
 * Verifies a 6-digit TOTP token against a secret with ±60s clock skew tolerance.
 */
export function verifyTotpCode(code: string, secret: string, window: number = 2): boolean {
  if (!code || !secret) return false;
  const cleanCode = code.trim().replace(/\D/g, '');
  if (cleanCode.length !== 6) return false;

  const timeStep = 30;
  const currentCounter = Math.floor(Date.now() / 1000 / timeStep);

  for (let i = -window; i <= window; i++) {
    const generated = calculateTotpToken(secret, currentCounter + i);
    if (generated === cleanCode) {
      return true;
    }
  }

  return false;
}
