import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { generateTotpSecret, generateQrCodeUrl, verifyTotpCode } from '@/lib/totp';
import { revalidatePath } from 'next/cache';

export const revalidate = 0;

export default async function Setup2FAPage() {
  let userPayload: any = null;
  let adminUser: any = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value || cookieStore.get('token')?.value;

    if (!token) redirect('/admin/login');

    try {
      userPayload = verifyToken(token);
    } catch {
      redirect('/admin/login');
    }

    const adminId = userPayload?.id || userPayload?.userId || userPayload?.sub;
    if (!adminId) redirect('/admin/login');

    const targetId = isNaN(Number(adminId)) ? adminId : Number(adminId);
    
    const userList = await db.select().from(users).where(eq(users.id, targetId as any));
    adminUser = userList[0];

    if (!adminUser) redirect('/admin/login');
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs space-y-2 text-center">
        <p className="font-bold text-sm">Initialization Error</p>
        <p>{err?.message || 'Check Vercel Environment Variables.'}</p>
      </div>
    );
  }

  if (adminUser.twoFactorEnabled === 1) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-emerald-100 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h1 className="text-xl font-bold text-gray-900">Two-Factor Authentication Active</h1>
        <p className="text-xs text-gray-600">
          Your account is secured with Google Authenticator & Email OTP fallback.
        </p>
      </div>
    );
  }

  // Check if existing secret is missing, too short (< 16), or contains invalid Base32 chars
  let secret = adminUser.twoFactorSecret;
  const isBase32Valid = secret && secret.length >= 16 && /^[A-Z2-7]+$/.test(secret);

  if (!isBase32Valid) {
    const generated = generateTotpSecret(adminUser.email || 'admin@ecolife.com');
    secret = generated.secret;
    await db.update(users).set({ twoFactorSecret: secret }).where(eq(users.id, adminUser.id));
  }

  const otpauth = `otpauth://totp/Ecolife%20Admin:${encodeURIComponent(
    adminUser.email || 'admin@ecolife.com'
  )}?secret=${secret}&issuer=Ecolife`;
  
  const qrCodeDataUrl = await generateQrCodeUrl(otpauth);

  async function activate2FA(formData: FormData) {
    'use server';
    const code = formData.get('code') as string;
    if (!code || !secret) return;

    const isValid = verifyTotpCode(code.trim(), secret);
    if (isValid) {
      await db.update(users).set({ twoFactorEnabled: 1 }).where(eq(users.id, adminUser.id));
      revalidatePath('/admin/setup-2fa');
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-2xl shadow-sm border border-emerald-100 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Setup 2-Factor Authentication</h1>
        <p className="text-xs text-gray-500 mt-1">
          Scan the QR code or copy the secret key below into Google Authenticator or Authy.
        </p>
      </div>

      <div className="flex justify-center p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-48 h-48 rounded-lg shadow-sm" />
      </div>

      <div className="space-y-1.5 text-center">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Manual Setup Key (Tap to Select)
        </label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs font-bold text-emerald-700 tracking-widest select-all break-all">
          {secret}
        </div>
      </div>

      <form action={activate2FA} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Verification Code
          </label>
          <input
            type="text"
            name="code"
            placeholder="000000"
            maxLength={6}
            required
            className="w-full text-center tracking-widest text-lg font-mono px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          Verify & Enable 2FA
        </button>
      </form>
    </div>
  );
}
