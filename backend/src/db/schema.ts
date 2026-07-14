import { mysqlTable, varchar, int, date, time } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),
});

export const lapangan = mysqlTable('lapangan', {
  // Menggunakan int + autoincrement agar kompatibel dengan MariaDB
  id: int('id').autoincrement().primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  harga: int('harga').notNull(),
});

export const reservasi = mysqlTable('reservasi', {
  // Menggunakan int + autoincrement agar kompatibel dengan MariaDB
  id: int('id').autoincrement().primaryKey(),
  lapanganId: int('lapangan_id').references(() => lapangan.id),
  userId: int('user_id').references(() => users.id),
  tanggal: date('tanggal').notNull(),
  jam: time('jam').notNull(),
  durasi: int('durasi').notNull(),
  status: varchar('status', { length: 50 }).default('Menunggu Pembayaran'),
});