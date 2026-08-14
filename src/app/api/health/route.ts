import { NextResponse } from 'next/server';

export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasJwtSecret = Boolean(process.env.JWT_SECRET);

  const status = hasDbUrl && hasJwtSecret ? 'ok' : 'missing_env';

  return NextResponse.json({
    status,
    env: {
      DATABASE_URL: hasDbUrl ? 'PRESENT' : 'MISSING',
      JWT_SECRET: hasJwtSecret ? 'PRESENT' : 'MISSING',
    },
  }, { status: status === 'ok' ? 200 : 500 });
}
