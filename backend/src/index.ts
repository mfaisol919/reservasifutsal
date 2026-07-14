import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from './db/index.js';
import { lapangan, reservasi, users } from './db/schema.js';

// Extend Request interface to include user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    nama: string;
    email: string;
    role: string;
  };
}

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'futsal_super_secret_key_123';

app.use(cors());
app.use(express.json());

// Middleware: Authenticate JWT Token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ pesan: "Akses ditolak. Token tidak ditemukan." });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || typeof decoded === 'string') {
      res.status(403).json({ pesan: "Token tidak valid atau kedaluwarsa." });
      return;
    }

    req.user = decoded as { id: number; nama: string; email: string; role: string };
    next();
  });
};

// Middleware: Admin Only
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ pesan: "Akses ditolak. Hanya untuk Administrator." });
    return;
  }
  next();
};

// --- AUTHENTICATION ENDPOINTS ---

// Register User
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      res.status(400).json({ pesan: "Semua kolom harus diisi." });
      return;
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      res.status(400).json({ pesan: "Email sudah terdaftar." });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [insertResult] = await db.insert(users).values({
      nama,
      email,
      password: hashedPassword,
      role: 'user', // Default role is user
    });

    res.status(201).json({
      pesan: "Registrasi berhasil!",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ pesan: "Gagal registrasi user." });
  }
});

// Login User
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ pesan: "Email dan password harus diisi." });
      return;
    }

    // Find user
    const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = foundUsers[0];

    if (!user) {
      res.status(400).json({ pesan: "Email atau password salah." });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ pesan: "Email atau password salah." });
      return;
    }

    // Generate JWT Token
    const payload = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      pesan: "Login berhasil!",
      token,
      user: payload,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ pesan: "Gagal login." });
  }
});

// Get current user info (authenticated)
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// --- COURT (LAPANGAN) ENDPOINTS ---

// Get all courts
app.get('/api/lapangan', async (req: Request, res: Response) => {
  try {
    const dataLapangan = await db.select().from(lapangan);
    res.json(dataLapangan);
  } catch (error) {
    console.error("Error fetching lapangan:", error);
    res.status(500).json({ pesan: "Gagal mengambil data lapangan" });
  }
});

// --- RESERVATION (BOOKING) ENDPOINTS ---

// Get all reservations (with court details and user details)
// Accessible by anyone (to check slots) but we will mask personal details if they are not admin
app.get('/api/reservasi', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let isAdmin = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
        if (decoded && decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) {
        // Suppress invalid token error for public route
      }
    }

    // Fetch all reservations and join with lapangan and users
    const allBookings = await db
      .select({
        id: reservasi.id,
        lapanganId: reservasi.lapanganId,
        lapanganNama: lapangan.nama,
        lapanganHarga: lapangan.harga,
        userId: reservasi.userId,
        userName: users.nama,
        userEmail: users.email,
        tanggal: reservasi.tanggal,
        jam: reservasi.jam,
        durasi: reservasi.durasi,
        status: reservasi.status,
      })
      .from(reservasi)
      .leftJoin(lapangan, eq(reservasi.lapanganId, lapangan.id))
      .leftJoin(users, eq(reservasi.userId, users.id));

    // If not admin, mask user information for data privacy
    if (!isAdmin) {
      const publicBookings = allBookings.map(b => ({
        id: b.id,
        lapanganId: b.lapanganId,
        lapanganNama: b.lapanganNama,
        tanggal: b.tanggal,
        jam: b.jam,
        durasi: b.durasi,
        status: b.status,
      }));
      res.json(publicBookings);
    } else {
      res.json(allBookings);
    }
  } catch (error) {
    console.error("Error fetching reservasi:", error);
    res.status(500).json({ pesan: "Gagal mengambil data reservasi" });
  }
});

// Get user specific reservations (authenticated)
app.get('/api/my-reservasi', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userBookings = await db
      .select({
        id: reservasi.id,
        lapanganId: reservasi.lapanganId,
        lapanganNama: lapangan.nama,
        lapanganHarga: lapangan.harga,
        tanggal: reservasi.tanggal,
        jam: reservasi.jam,
        durasi: reservasi.durasi,
        status: reservasi.status,
      })
      .from(reservasi)
      .leftJoin(lapangan, eq(reservasi.lapanganId, lapangan.id))
      .where(eq(reservasi.userId, userId));

    res.json(userBookings);
  } catch (error) {
    console.error("Error fetching my-reservasi:", error);
    res.status(500).json({ pesan: "Gagal mengambil riwayat booking Anda" });
  }
});

// Create booking (authenticated)
app.post('/api/booking', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lapanganId, tanggal, jam, durasi } = req.body;
    const userId = req.user!.id;

    if (!lapanganId || !tanggal || !jam || !durasi) {
      res.status(400).json({ pesan: "Data booking tidak lengkap" });
      return;
    }

    // Optional double booking check: check if court is already booked at that date and time slot
    // For simplicity, let's verify if there is any overlapping booking
    const existing = await db
      .select()
      .from(reservasi)
      .where(
        and(
          eq(reservasi.lapanganId, Number(lapanganId)),
          eq(reservasi.tanggal, tanggal),
          eq(reservasi.jam, jam)
        )
      );

    // Check if the slot is already booked and not cancelled
    const activeBookingExists = existing.some(b => b.status !== 'Dibatalkan');
    if (activeBookingExists) {
      res.status(400).json({ pesan: "Jadwal lapangan pada jam tersebut sudah dipesan." });
      return;
    }

    const [insertResult] = await db.insert(reservasi).values({
      lapanganId: Number(lapanganId),
      userId,
      tanggal,
      jam,
      durasi: Number(durasi),
      status: "Menunggu Pembayaran",
    });

    res.status(201).json({
      pesan: "Booking berhasil dibuat! Silakan hubungi admin untuk melakukan pembayaran.",
      data: {
        id: insertResult.insertId,
        lapanganId,
        userId,
        tanggal,
        jam,
        durasi,
        status: "Menunggu Pembayaran",
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ pesan: "Gagal membuat booking" });
  }
});

// Update booking status (admin only)
app.patch('/api/reservasi/:id/status', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ pesan: "Status pembayaran harus diisi." });
      return;
    }

    const bookingId = Number(id);
    const existingBooking = await db.select().from(reservasi).where(eq(reservasi.id, bookingId)).limit(1);

    if (existingBooking.length === 0) {
      res.status(404).json({ pesan: "Booking tidak ditemukan." });
      return;
    }

    await db
      .update(reservasi)
      .set({ status })
      .where(eq(reservasi.id, bookingId));

    res.json({ pesan: `Status booking #${id} berhasil diupdate menjadi '${status}'` });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ pesan: "Gagal mengupdate status booking." });
  }
});

app.listen(PORT, () => console.log(`Server TS Futsal jalan di http://localhost:${PORT}`));