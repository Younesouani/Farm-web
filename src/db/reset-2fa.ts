import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  await db.update(users).set({
    twoFactorEnabled: 0,
    twoFactorSecret: null,
  }).where(eq(users.email, 'unesouani007@gmail.com'));

  console.log('Successfully reset 2FA for unesouani007@gmail.com');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
