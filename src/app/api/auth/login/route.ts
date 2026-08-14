import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email ? String(body.email).trim().toLowerCase() : '';
    const password = body.password ? String(body.password) : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Fetch user from database
    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userList[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 2. Verify password
    const isValid = await verifyPassword(password, user.password || '');
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();

    // 3. If 2FA is active (1), require verification step
    if (user.twoFactorEnabled === 1 || user.twoFactorEnabled === true as any) {
      cookieStore.set('pending_2fa_user_id', String(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10,
      });

      return NextResponse.json({
        success: true,
        requires2FA: true,
        redirectTo: '/admin/verify-2fa',
      });
    }

    // 4. If 2FA is NOT enabled (0), log in and send directly to /admin/setup-2fa
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

    return NextResponse.json({
      success: true,
      requires2FA: false,
      redirectTo: '/admin/setup-2fa',
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
