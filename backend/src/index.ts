import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import { lapangan, reservasi } from './db/schema.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Get all court fields
app.get('/api/lapangan', async (req: Request, res: Response) => {
    try {
        const dataLapangan = await db.select().from(lapangan);
        res.json(dataLapangan);
    } catch (error) {
        console.error("Error fetching lapangan:", error);
        res.status(500).json({ pesan: "Gagal mengambil data lapangan" });
    }
});

// Get all reservations
app.get('/api/reservasi', async (req: Request, res: Response) => {
    try {
        const dataReservasi = await db.select().from(reservasi);
        res.json(dataReservasi);
    } catch (error) {
        console.error("Error fetching reservasi:", error);
        res.status(500).json({ pesan: "Gagal mengambil data reservasi" });
    }
});

// Add a booking reservation
app.post('/api/booking', async (req: Request, res: Response) => {
    try {
        const { lapanganId, tanggal, jam, durasi } = req.body;
        
        if (!lapanganId || !tanggal || !jam || !durasi) {
            res.status(400).json({ pesan: "Data booking tidak lengkap" });
            return;
        }

        const [insertResult] = await db.insert(reservasi).values({
            lapanganId: Number(lapanganId),
            tanggal,
            jam,
            durasi: Number(durasi),
            status: "Menunggu Pembayaran"
        });

        res.status(201).json({
            pesan: "Booking berhasil dibuat!",
            data: {
                id: insertResult.insertId,
                lapanganId,
                tanggal,
                jam,
                durasi,
                status: "Menunggu Pembayaran"
            }
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ pesan: "Gagal membuat booking" });
    }
});

app.listen(PORT, () => console.log(`Server TS Futsal jalan di http://localhost:${PORT}`));