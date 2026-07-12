import { mysqlTable, varchar, int, date, time } from 'drizzle-orm/mysql-core';

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
  tanggal: date('tanggal').notNull(),
  jam: time('jam').notNull(),
  durasi: int('durasi').notNull(),
  status: varchar('status', { length: 50 }).default('Menunggu Pembayaran'),
});