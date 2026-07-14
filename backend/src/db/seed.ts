import { db } from './index.js';
import { lapangan, users } from './schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log("Seeding database...");
  try {
    // 1. Seed lapangan (courts)
    console.log("Seeding lapangan table...");
    // Check if lapangan is empty
    const existingLapangans = await db.select().from(lapangan);
    if (existingLapangans.length === 0) {
      await db.insert(lapangan).values([
        { nama: "Lapangan A (Vinyl Premium)", harga: 150000 },
        { nama: "Lapangan B (Rumput Sintetis)", harga: 120000 },
        { nama: "Lapangan C (Matras Interlock)", harga: 100000 }
      ]);
      console.log("Successfully seeded 3 futsal courts!");
    } else {
      console.log("Lapangan table already has data.");
    }

    // 2. Seed users (admin and user)
    console.log("Seeding users table...");
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash("admin123", salt);
      const userPassword = await bcrypt.hash("user123", salt);

      await db.insert(users).values([
        {
          nama: "Administrator",
          email: "admin@futsal.com",
          password: adminPassword,
          role: "admin"
        },
        {
          nama: "Faisol Customer",
          email: "user@futsal.com",
          password: userPassword,
          role: "user"
        }
      ]);
      console.log("Successfully seeded admin and user accounts!");
    } else {
      console.log("Users table already has data.");
    }

    console.log("Seeding finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seed();
