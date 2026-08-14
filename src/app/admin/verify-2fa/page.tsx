import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Verify2FAClient from './Verify2FAClient';

export default async function Verify2FAPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const pending2FA = cookieStore.get('pending_2fa_user_id')?.value;

  // 1. If user is fully logged in, send to admin dashboard
  if (authToken) {
    redirect('/admin');
  }

  // 2. If no pending 2FA cookie, user hasn't passed password check -> send to login
  if (!pending2FA) {
    redirect('/login');
  }

  return <Verify2FAClient />;
}
