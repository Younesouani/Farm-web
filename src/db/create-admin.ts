import { db } from './index';
import { users } from './schema';
import { hashPassword } from '../lib/auth';

async function main() {
  const adminEmail = 'unesouani007@gmail.com';
  const rawPassword = 'Norway Hathway';

  try {
    const hashedPassword = await hashPassword(rawPassword);

    await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('✅ Admin user created successfully in database!');
    console.log('Email:', adminEmail);
  } catch (error: any) {
    console.error('❌ Failed to create admin user:', error.message || error);
  }
  process.exit(0);
}

main();
