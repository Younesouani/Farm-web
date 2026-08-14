import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const pending2FA = cookieStore.get('pending_2fa_user_id')?.value;

  if (!authToken && pending2FA) {
    return <>{children}</>;
  }

  if (!authToken) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-x-hidden max-w-full">
        {children}
      </main>
    </div>
  );
}
