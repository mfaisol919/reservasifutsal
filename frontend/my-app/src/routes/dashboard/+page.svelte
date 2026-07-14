<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, apiFetch, BACKEND_URL } from '$lib/auth.svelte.js';
  import { 
    Calendar as CalendarIcon, 
    Clock, 
    CreditCard, 
    FileText, 
    Plus, 
    CheckCircle, 
    AlertTriangle, 
    XCircle, 
    Activity,
    RefreshCw
  } from '@lucide/svelte';

  interface Lapangan {
    id: number;
    nama: string;
    harga: number;
  }

  interface Reservasi {
    id: number;
    lapanganId: number;
    lapanganNama: string;
    lapanganHarga: number;
    tanggal: string;
    jam: string;
    durasi: number;
    status: string;
  }

  // State
  let loading = $state(true);
  let myReservations = $state<Reservasi[]>([]);
  let lapangans = $state<Lapangan[]>([]);
  let allReservations = $state<any[]>([]); // used for slot availability checks

  // Form State
  let selectedLapanganId = $state<number>(0);
  let selectedDate = $state<string>('');
  let selectedJam = $state<string>('');
  let selectedDurasi = $state<number>(1);

  let formLoading = $state(false);
  let formError = $state('');
  let formSuccess = $state('');

  // Available Time Slots (08:00 - 22:00)
  const timeSlots = [
    "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00", "13:00:00", 
    "14:00:00", "15:00:00", "16:00:00", "17:00:00", "18:00:00", "19:00:00", 
    "20:00:00", "21:00:00", "22:00:00"
  ];

  // Helper to get today's date formatted as YYYY-MM-DD
  function getTodayString() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  onMount(async () => {
    // Check authentication
    auth.init();
    if (!auth.user) {
      goto('/login');
      return;
    }

    selectedDate = getTodayString();
    await loadDashboardData();
  });

  async function loadDashboardData() {
    loading = true;
    try {
      // 1. Fetch lapangans
      const lpRes = await fetch(`${BACKEND_URL}/api/lapangan`);
      if (lpRes.ok) {
        lapangans = await lpRes.json();
        if (lapangans.length > 0) {
          selectedLapanganId = lapangans[0]!.id;
        }
      }

      // 2. Fetch my reservations
      const myRes = await apiFetch('/api/my-reservasi');
      if (myRes.ok) {
        myReservations = await myRes.json();
      }

      // 3. Fetch all reservations to compute taken slots
      const allRes = await fetch(`${BACKEND_URL}/api/reservasi`);
      if (allRes.ok) {
        allReservations = await allRes.json();
      }
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  // Compute disabled time slots based on selected court and date
  function isSlotBooked(slot: string) {
    if (!selectedLapanganId || !selectedDate) return false;
    
    // Check if there is any active booking matching court, date, and time
    return allReservations.some(b => {
      // Normalize date comparison (Drizzle date type returns YYYY-MM-DD)
      const bDate = b.tanggal.substring(0, 10);
      const selDate = selectedDate.substring(0, 10);
      
      // Match court ID, date, and hour
      return Number(b.lapanganId) === Number(selectedLapanganId) && 
             bDate === selDate && 
             b.jam === slot && 
             b.status !== 'Dibatalkan';
    });
  }

  async function handleCreateBooking(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedLapanganId || !selectedDate || !selectedJam || !selectedDurasi) {
      formError = 'Lengkapi semua isian form booking';
      return;
    }

    formLoading = true;
    formError = '';
    formSuccess = '';

    try {
      const response = await apiFetch('/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          lapanganId: selectedLapanganId,
          tanggal: selectedDate,
          jam: selectedJam,
          durasi: selectedDurasi
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.pesan || 'Gagal membuat booking');
      }

      formSuccess = 'Booking berhasil diajukan! Silakan lunasi pembayaran dan kirim bukti ke WhatsApp Admin.';
      selectedJam = ''; // reset
      
      // Reload lists
      await loadDashboardData();
    } catch (err: any) {
      formError = err.message || 'Terjadi kesalahan sistem';
    } finally {
      formLoading = false;
    }
  }

  // Get selected court price rate
  const selectedCourtRate = $derived(() => {
    const court = lapangans.find(l => Number(l.id) === Number(selectedLapanganId));
    return court ? court.harga : 0;
  });

  const totalPrice = $derived(() => {
    return selectedCourtRate() * selectedDurasi;
  });
</script>

<svelte:head>
  <title>Dashboard Reservasi - Arena Futsal Hub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
  <!-- Header Welcome -->
  <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-8 mb-10 gap-4">
    <div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
        <Activity class="w-8 h-8 text-emerald-500" /> Dashboard Pemesanan
      </h1>
      <p class="text-slate-400 mt-2 text-sm sm:text-base">
        Halo, <span class="text-emerald-400 font-bold">{auth.user?.nama || 'Pelanggan'}</span>! Kelola dan ajukan sewa lapangan futsal Anda di sini.
      </p>
    </div>
    
    <button 
      onclick={loadDashboardData}
      class="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 self-start md:self-auto"
    >
      <RefreshCw class="w-4 h-4" /> Refresh Data
    </button>
  </div>

  {#if loading}
    <div class="flex justify-center items-center py-32">
      <div class="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      
      <!-- COLUMN 1 & 2: RESERVATIONS LIST & FORM -->
      <div class="lg:col-span-2 space-y-10">
        
        <!-- NEW RESERVATION FORM -->
        <div class="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
          <h2 class="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus class="w-6 h-6 text-emerald-400" /> Sewa Lapangan Baru
          </h2>

          {#if formError}
            <div class="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle class="w-5 h-5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          {/if}

          {#if formSuccess}
            <div class="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle class="w-5 h-5 flex-shrink-0" />
              <span>{formSuccess}</span>
            </div>
          {/if}

          <form onsubmit={handleCreateBooking} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Court Select -->
              <div>
                <label for="lapangan" class="block text-sm font-semibold text-slate-300 mb-2">Pilih Lapangan</label>
                <select
                  id="lapangan"
                  bind:value={selectedLapanganId}
                  class="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-100 text-sm transition-all"
                >
                  {#each lapangans as lap}
                    <option value={lap.id}>{lap.nama} (Rp {lap.harga.toLocaleString('id-ID')}/jam)</option>
                  {/each}
                </select>
              </div>

              <!-- Date Select -->
              <div>
                <label for="tanggal" class="block text-sm font-semibold text-slate-300 mb-2">Pilih Tanggal</label>
                <input
                  id="tanggal"
                  type="date"
                  required
                  min={getTodayString()}
                  bind:value={selectedDate}
                  class="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-100 text-sm transition-all"
                />
              </div>
            </div>

            <!-- Time slot picker -->
            <div>
              <label class="block text-sm font-semibold text-slate-300 mb-3">Pilih Jam Mulai (Live Slot Checking)</label>
              <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {#each timeSlots as slot}
                  {@const isBooked = isSlotBooked(slot)}
                  {@const slotHour = slot.substring(0, 5)}
                  
                  <button
                    type="button"
                    disabled={isBooked}
                    onclick={() => selectedJam = slot}
                    class="py-2.5 px-2 text-center rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 
                      {isBooked 
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed line-through' 
                        : selectedJam === slot
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }"
                  >
                    {slotHour}
                    <span class="block text-[10px] opacity-70 mt-0.5">
                      {isBooked ? 'Booked' : 'Tersedia'}
                    </span>
                  </button>
                {/each}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <!-- Duration Select -->
              <div>
                <label for="durasi" class="block text-sm font-semibold text-slate-300 mb-2">Durasi Sewa (Jam)</label>
                <select
                  id="durasi"
                  bind:value={selectedDurasi}
                  class="block w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-100 text-sm transition-all"
                >
                  <option value={1}>1 Jam</option>
                  <option value={2}>2 Jam</option>
                  <option value={3}>3 Jam</option>
                </select>
              </div>

              <!-- Price Card Preview -->
              <div class="bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span class="text-xs text-slate-500 uppercase tracking-wider block">Estimasi Total Harga</span>
                  <span class="text-2xl font-black text-emerald-400">
                    Rp {totalPrice().toLocaleString('id-ID')}
                  </span>
                </div>
                <div class="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-lg">
                  <CreditCard class="w-5 h-5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading || !selectedJam}
              class="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {#if formLoading}
                <div class="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
              {:else}
                <Plus class="w-5 h-5" /> Ajukan Pemesanan
              {/if}
            </button>
          </form>
        </div>

        <!-- MY RESERVATIONS LIST -->
        <div class="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
          <h2 class="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText class="w-6 h-6 text-emerald-400" /> Riwayat Booking Anda
          </h2>

          {#if myReservations.length === 0}
            <div class="text-center py-12 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
              <CalendarIcon class="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p class="text-slate-400 text-sm">Anda belum memiliki riwayat reservasi lapangan futsal.</p>
              <p class="text-xs text-slate-500 mt-1">Gunakan form di atas untuk membuat pesanan baru.</p>
            </div>
          {:else}
            <div class="space-y-4">
              {#each myReservations as booking}
                {@const total = booking.lapanganHarga * booking.durasi}
                
                <div class="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-slate-700 transition-colors">
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-slate-400">#BK-{booking.id}</span>
                      
                      <!-- Status Badges -->
                      {#if booking.status === 'Menunggu Pembayaran'}
                        <span class="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Clock class="w-3 h-3" /> Menunggu Pembayaran
                        </span>
                      {:else if booking.status === 'Lunas'}
                        <span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle class="w-3 h-3" /> Lunas
                        </span>
                      {:else}
                        <span class="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <XCircle class="w-3 h-3" /> Dibatalkan
                        </span>
                      {/if}
                    </div>

                    <h3 class="text-lg font-bold text-white">{booking.lapanganNama}</h3>
                    
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs sm:text-sm">
                      <span class="flex items-center gap-1"><CalendarIcon class="w-4 h-4 text-emerald-500" /> {booking.tanggal.substring(0, 10)}</span>
                      <span class="flex items-center gap-1"><Clock class="w-4 h-4 text-emerald-500" /> {booking.jam.substring(0, 5)} WIB ({booking.durasi} Jam)</span>
                    </div>
                  </div>

                  <div class="sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t border-slate-900 sm:border-0 pt-3 sm:pt-0">
                    <span class="text-xs text-slate-500 block uppercase tracking-wider">Total Pembayaran</span>
                    <span class="text-xl font-bold text-emerald-400">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- COLUMN 3: PAYMENT INSTRUCTIONS -->
      <div class="space-y-6">
        <div class="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col gap-5">
          <h3 class="text-lg font-extrabold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <CreditCard class="w-5 h-5 text-emerald-400" /> Instruksi Pembayaran
          </h3>

          <div class="space-y-4 text-sm text-slate-300">
            <p>Untuk merubah status pesanan Anda menjadi <strong class="text-emerald-400">Lunas</strong>, silakan lakukan pembayaran transfer bank:</p>
            
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
              <span class="text-xs text-slate-500 block">BANK BCA</span>
              <strong class="text-white text-base tracking-wider block">872-0345-920</strong>
              <span class="text-xs text-slate-400 block">A.N. Arena Futsal Hub</span>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
              <span class="text-xs text-slate-500 block">BANK MANDIRI</span>
              <strong class="text-white text-base tracking-wider block">142-00-14930-49</strong>
              <span class="text-xs text-slate-400 block">A.N. Arena Futsal Hub</span>
            </div>

            <div class="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-xs text-emerald-400 space-y-2">
              <h4 class="font-bold flex items-center gap-1">
                <CheckCircle class="w-3.5 h-3.5" /> Konfirmasi Cepat
              </h4>
              <p>Setelah melakukan transfer, silakan kirimkan bukti bayar dan Nomor Booking (#BK-x) melalui WhatsApp Admin:</p>
              <a 
                href="https://wa.me/6281234567890" 
                target="_blank" 
                class="inline-block mt-2 font-bold underline text-white hover:text-emerald-300 transition-colors"
              >
                Kirim Bukti via WhatsApp (+62 812-3456-7890)
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  {/if}
</div>
