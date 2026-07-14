<script lang="ts">
  import { onMount } from 'svelte';
  import { BACKEND_URL } from '$lib/auth.svelte.js';
  import { Calendar, CheckCircle2, ShieldCheck, Zap, Star, Flame, Trophy } from '@lucide/svelte';

  interface Lapangan {
    id: number;
    nama: string;
    harga: number;
  }

  let lapangans = $state<Lapangan[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/lapangan`);
      if (!res.ok) throw new Error('Gagal memuat data lapangan');
      lapangans = await res.json();
    } catch (err: any) {
      error = err.message || 'Gagal memuat lapangan';
      // Fallback local data if backend is offline/loading
      lapangans = [
        { id: 1, nama: "Lapangan A (Vinyl Premium)", harga: 150000 },
        { id: 2, nama: "Lapangan B (Rumput Sintetis)", harga: 120000 },
        { id: 3, nama: "Lapangan C (Matras Interlock)", harga: 100000 }
      ];
    } finally {
      loading = false;
    }
  });

  // Descriptions helper for premium look
  const courtDescriptions: Record<number, { desc: string; type: string; badge: string }> = {
    1: { 
      desc: "Lantai vinyl berkualitas internasional dengan daya redam kejut tinggi untuk performa maksimal dan minimal resiko cedera.", 
      type: "Vinyl Premium",
      badge: "Terpopuler"
    },
    2: { 
      desc: "Rumput sintetis kualitas tinggi dengan ketebalan optimal yang empuk, cocok untuk permainan tempo tinggi dan taktis.", 
      type: "Rumput Sintetis",
      badge: "Paling Nyaman"
    },
    3: { 
      desc: "Sistem matras interlock kokoh dengan traksi sempurna. Rekomendasi terbaik untuk latihan rutin dan turnamen lokal.", 
      type: "Matras Interlock",
      badge: "Best Value"
    }
  };

  const reviews = [
    { name: "Rian Hidayat", role: "Kapten FC Solid", comment: "Lapangan Vinyl-nya luar biasa! Lembut di lutut dan tidak licin. Pemesanan lewat website sangat instan.", stars: 5 },
    { name: "Doni Setiawan", role: "Komunitas Futsal Surabaya", comment: "Sangat suka dengan rumput sintetisnya yang empuk dan terawat. Pembayarannya gampang dikonfirmasi admin.", stars: 5 },
    { name: "Faisol Rahman", role: "Pecinta Olahraga", comment: "Fasilitas lengkap, parkir luas, dan booking jadwal jadi gampang sekali tinggal pilih jam kosong di web.", stars: 5 }
  ];
</script>

<!-- Hero Section -->
<section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 px-4">
  <!-- Background Image with Dark Overlays -->
  <div class="absolute inset-0 bg-[url('/images/futsal_arena_hero.png')] bg-cover bg-center"></div>
  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/50"></div>
  
  <div class="relative max-w-5xl mx-auto text-center flex flex-col items-center gap-6 z-10">
    <div class="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20 text-sm font-semibold tracking-wide uppercase animate-pulse">
      <Trophy class="w-4 h-4" /> Arena Futsal Terbaik di Surabaya
    </div>
    
    <h1 class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
      Main Futsal dengan <br />
      <span class="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
        Pengalaman Kelas Dunia
      </span>
    </h1>
    
    <p class="text-slate-300 text-base sm:text-xl max-w-2xl font-light">
      Temukan lapangan berkualitas tinggi, pantau ketersediaan jadwal secara real-time, dan lakukan reservasi instan kapan saja 24/7.
    </p>
    
    <div class="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
      <a 
        href="/dashboard" 
        class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
      >
        <Calendar class="w-5 h-5" /> Pesan Lapangan Sekarang
      </a>
      <a 
        href="#lapangan" 
        class="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center"
      >
        Lihat Detail Lapangan
      </a>
    </div>
  </div>
</section>

<!-- Features Info Grid -->
<section class="py-16 sm:py-24 bg-slate-950 border-t border-slate-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Kenapa Memilih FutsalHub?</h2>
      <p class="text-slate-400 mt-3">Kami menyediakan fasilitas penunjang premium untuk menjamin kenyamanan Anda bermain futsal.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Feature 1 -->
      <div class="bg-slate-900/50 border border-slate-850 p-8 rounded-2xl flex flex-col gap-4 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1">
        <div class="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl w-fit group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-bold text-white">Standar Internasional</h3>
        <p class="text-slate-400 text-sm leading-relaxed">
          Semua lapangan menggunakan material standar FIFA, mulai dari ketebalan rumput sintetis hingga elastisitas lantai vinyl premium.
        </p>
      </div>

      <!-- Feature 2 -->
      <div class="bg-slate-900/50 border border-slate-850 p-8 rounded-2xl flex flex-col gap-4 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1">
        <div class="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl w-fit group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
          <Zap class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-bold text-white">Pencahayaan LED Terang</h3>
        <p class="text-slate-400 text-sm leading-relaxed">
          Didukung lampu sorot LED modern bebas bayangan di setiap sudut lapangan untuk menjamin visibilitas sempurna pada malam hari.
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="bg-slate-900/50 border border-slate-850 p-8 rounded-2xl flex flex-col gap-4 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1">
        <div class="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl w-fit group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
          <CheckCircle2 class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-bold text-white">Booking Online Instan</h3>
        <p class="text-slate-400 text-sm leading-relaxed">
          Tidak perlu telepon atau datang langsung. Cek jadwal kosong secara live, klik booking, bayar, dan lapangan langsung aman untuk Anda.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Court Showcase Section -->
<section id="lapangan" class="py-16 sm:py-24 bg-slate-900/40 border-t border-slate-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-16">
      <div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Pilihan Lapangan Kami</h2>
        <p class="text-slate-400 mt-2">Pilih jenis lapangan yang paling sesuai dengan gaya bermain tim Anda.</p>
      </div>
      <div class="text-slate-400 text-sm mt-4 md:mt-0 flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
        <Flame class="w-4 h-4 text-orange-500" /> Harga di bawah sudah termasuk pajak & fasilitas air minum
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center items-center py-20">
        <div class="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each lapangans as lapangan}
          {@const info = courtDescriptions[lapangan.id] || { desc: "Fasilitas lapangan futsal lengkap dan bersih.", type: "Standar", badge: "Pilihan Utama" }}
          
          <div class="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col hover:scale-[1.01] hover:shadow-2xl hover:shadow-slate-950">
            <!-- Image Frame -->
            <div class="relative h-56 bg-slate-950 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
              <img 
                src="/images/futsal_arena_hero.png" 
                alt={lapangan.nama} 
                class="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700" 
              />
              <span class="absolute top-4 left-4 z-20 bg-emerald-500 text-slate-950 font-bold text-xs uppercase px-3 py-1 rounded-full">
                {info.badge}
              </span>
            </div>

            <!-- Details -->
            <div class="p-6 sm:p-8 flex flex-col flex-grow gap-4">
              <h3 class="text-xl sm:text-2xl font-bold text-white">{lapangan.nama}</h3>
              <p class="text-slate-400 text-sm leading-relaxed flex-grow">
                {info.desc}
              </p>
              
              <div class="border-t border-slate-800 pt-4 flex items-center justify-between mt-2">
                <div>
                  <span class="text-xs text-slate-500 uppercase tracking-wider block">Harga sewa</span>
                  <span class="text-2xl font-black text-emerald-400">
                    Rp {lapangan.harga.toLocaleString('id-ID')}
                  </span>
                  <span class="text-slate-400 text-xs font-medium">/ jam</span>
                </div>
                
                <a 
                  href="/dashboard"
                  class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                >
                  Pesan
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<!-- Review / Testimonial Section -->
<section class="py-16 sm:py-24 bg-slate-950 border-t border-slate-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto mb-16">
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Apa Kata Pelanggan Kami?</h2>
      <p class="text-slate-400 mt-2">Ulasan jujur dari komunitas dan pemain setia di FutsalHub.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each reviews as review}
        <div class="bg-slate-900/40 border border-slate-850 p-8 rounded-2xl flex flex-col gap-4">
          <div class="flex items-center gap-1 text-emerald-400">
            {#each Array(review.stars) as _}
              <Star class="w-4 h-4 fill-emerald-400" />
            {/each}
          </div>
          <p class="text-slate-300 text-sm italic leading-relaxed">
            "{review.comment}"
          </p>
          <div class="border-t border-slate-800 pt-4 mt-auto">
            <h4 class="text-white font-semibold text-sm">{review.name}</h4>
            <span class="text-slate-500 text-xs">{review.role}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Call to Action Banner -->
<section class="py-16 bg-gradient-to-r from-emerald-550 to-teal-600 relative overflow-hidden">
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-950/20 via-transparent to-transparent"></div>
  <div class="relative max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6 z-10">
    <h2 class="text-3xl sm:text-5xl font-black text-white leading-tight">
      Siap Bertanding Hari Ini?
    </h2>
    <p class="text-emerald-100 max-w-xl text-sm sm:text-base">
      Daftar dalam waktu kurang dari 1 menit dan dapatkan jadwal lapangan futsal favorit Anda sebelum kehabisan slot.
    </p>
    <a 
      href="/register" 
      class="bg-white hover:bg-emerald-50 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-slate-950/20"
    >
      Daftar Akun Sekarang
    </a>
  </div>
</section>
