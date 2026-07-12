import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Tipe data untuk TypeScript
interface Lapangan {
    id: number;
    nama: string;
    harga: number;
}

interface Reservasi {
    id: number;
    lapanganId: number;
    tanggal: string;
    jam: string;
    durasi: number;
    status: string;
}

// Data dummy
const daftarLapangan: Lapangan[] = [
    { id: 1, nama: "Lapangan Sintetis A", harga: 150000 },
    { id: 2, nama: "Lapangan Matras B", harga: 130000 }
];

let daftarReservasi: Reservasi[] = [
    { id: 1, lapanganId: 1, tanggal: "2026-07-15", jam: "19:00", durasi: 2, status: "Lunas" }
];

app.get('/api/lapangan', (req: Request, res: Response) => {
    res.json(daftarLapangan);
});

app.get('/api/reservasi', (req: Request, res: Response) => {
    res.json(daftarReservasi);
});

app.post('/api/booking', (req: Request, res: Response) => {
    const dataBaru = req.body;
    const reservasiBaru: Reservasi = {
        id: daftarReservasi.length + 1,
        ...dataBaru,
        status: "Menunggu Pembayaran"
    };
    daftarReservasi.push(reservasiBaru);
    res.status(201).json({ pesan: "Booking berhasil dibuat!", data: reservasiBaru });
});

app.listen(PORT, () => console.log(`Server TS Futsal jalan di http://localhost:${PORT}`));