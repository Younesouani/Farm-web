
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyTotpCode } from '@/lib/totp';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = body.code ? String(body.code).trim() : '';

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'A 6-digit code is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const pendingUserId = cookieStore.get('pending_2fa_user_id')?.value;

    if (!pendingUserId) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    // 1. Fetch user from DB
    const targetId = isNaN(Number(pendingUserId)) ? pendingUserId : Number(pendingUserId);
    const userList = await db.select().from(users).where(eq(users.id, targetId as any)).limit(1);
    const user = userList[0];

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'User 2FA secret not found' },
        { status: 400 }
      );
    }

    // 2. Verify TOTP code against DB secret
    const isValid = verifyTotpCode(code, user.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 2FA code. Please check your authenticator app.' },
        { status: 400 }
      );
    }

    // 3. Set auth_token cookie and clear pending_2fa cookie
    const token = generateToken({
      userId: String(user.id),
      role: user.role || 'admin',
    });

    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.delete('pending_2fa_user_id');

    return NextResponse.json({ success: true, redirectTo: '/admin' });
  } catch (error: any) {
    console.error('2FA Verification Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
