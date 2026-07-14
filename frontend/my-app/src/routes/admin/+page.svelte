<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth, apiFetch } from '$lib/auth.svelte.js';
  import { 
    Shield, 
    Calendar, 
    DollarSign, 
    Users, 
    Check, 
    X, 
    Clock, 
    AlertCircle, 
    RefreshCw,
    Trophy
  } from '@lucide/svelte';

  interface Booking {
    id: number;
    lapanganId: number;
    lapanganNama: string;
    lapanganHarga: number;
    userId: number;
    userName: string;
    userEmail: string;
    tanggal: string;
    jam: string;
    durasi: number;
    status: string;
  }

  // State
  let loading = $state(true);
  let errorMsg = $state('');
  let successMsg = $state('');
  let bookings = $state<Booking[]>([]);

  // Action status loading tracker (by booking ID)
  let actionLoadingId = $state<number | null>(null);

  onMount(async () => {
    auth.init();
    // Protect page: only allow admin
    if (!auth.user || auth.user.role !== 'admin') {
      goto('/');
      return;
    }

    await loadAllBookings();
  });

  async function loadAllBookings() {
    loading = true;
    errorMsg = '';
    try {
      const res = await apiFetch('/api/reservasi');
      if (!res.ok) {
        throw new Error('Gagal mengambil data booking dari server.');
      }
      bookings = await res.json();
    } catch (err: any) {
      errorMsg = err.message || 'Terjadi kesalahan jaringan';
    } finally {
      loading = false;
    }
  }

  async function updateStatus(bookingId: number, newStatus: string) {
    actionLoadingId = bookingId;
    errorMsg = '';
    successMsg = '';

    try {
      const res = await apiFetch(`/api/reservasi/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.pesan || 'Gagal mengubah status');
      }

      successMsg = `Status booking #${bookingId} sukses diubah menjadi '${newStatus}'`;
      
      // Reload list
      await loadAllBookings();
    } catch (err: any) {
      errorMsg = err.message || 'Terjadi kesalahan sistem';
    } finally {
      actionLoadingId = null;
    }
  }

  // Derive Statistics
  const totalBookings = $derived(() => bookings.length);
  
  const totalEarnings = $derived(() => {
    return bookings
      .filter(b => b.status === 'Lunas')
      .reduce((sum, b) => sum + (b.lapanganHarga * b.durasi), 0);
  });

  const pendingBookings = $derived(() => {
    return bookings.filter(b => b.status === 'Menunggu Pembayaran').length;
  });

  const uniqueCustomers = $derived(() => {
    const userIds = bookings.map(b => b.userId).filter(Boolean);
    return new Set(userIds).size;
  });
</script>

<svelte:head>
  <title>Admin Panel - Arena Futsal Hub</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
  <!-- Header Title -->
  <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-8 mb-10 gap-4">
    <div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
        <Shield class="w-8 h-8 text-rose-500" /> Admin Management Panel
      </h1>
      <p class="text-slate-400 mt-2 text-sm sm:text-base">
        Pantau reservasi futsal masuk, kelola status pembayaran, dan analisis pendapatan Anda.
      </p>
    </div>
    
    <button 
      onclick={loadAllBookings}
      class="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 self-start md:self-auto"
    >
      <RefreshCw class="w-4 h-4" /> Muat Ulang Data
    </button>
  </div>

  <!-- Error or Success Alert Banner -->
  {#if errorMsg}
    <div class="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
      <AlertCircle class="w-5 h-5 flex-shrink-0" />
      <span>{errorMsg}</span>
    </div>
  {/if}

  {#if successMsg}
    <div class="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
      <Check class="w-5 h-5 flex-shrink-0" />
      <span>{successMsg}</span>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center items-center py-32">
      <div class="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
    </div>
  {:else}
    <!-- STATS OVERVIEW CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      
      <!-- Earnings -->
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Pendapatan</span>
          <h3 class="text-2xl font-black text-emerald-400">Rp {totalEarnings().toLocaleString('id-ID')}</h3>
        </div>
        <div class="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl">
          <DollarSign class="w-6 h-6" />
        </div>
      </div>

      <!-- Total Bookings -->
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Booking</span>
          <h3 class="text-2xl font-black text-white">{totalBookings()}</h3>
        </div>
        <div class="bg-blue-500/10 text-blue-400 p-3.5 rounded-xl">
          <Calendar class="w-6 h-6" />
        </div>
      </div>

      <!-- Pending Bookings -->
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Menunggu Bayar</span>
          <h3 class="text-2xl font-black text-amber-400">{pendingBookings()}</h3>
        </div>
        <div class="bg-amber-500/10 text-amber-400 p-3.5 rounded-xl">
          <Clock class="w-6 h-6" />
        </div>
      </div>

      <!-- Total Customers -->
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">Penyewa Aktif</span>
          <h3 class="text-2xl font-black text-purple-400">{uniqueCustomers()}</h3>
        </div>
        <div class="bg-purple-500/10 text-purple-400 p-3.5 rounded-xl">
          <Users class="w-6 h-6" />
        </div>
      </div>

    </div>

    <!-- BOOKINGS DATA TABLE -->
    <div class="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      <div class="px-6 py-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">Daftar Pengajuan Sewa Lapangan</h3>
        <span class="text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-850">
          Total: {bookings.length} Pesanan
        </span>
      </div>

      {#if bookings.length === 0}
        <div class="text-center py-20 bg-slate-900/30">
          <Trophy class="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p class="text-slate-400 font-semibold text-lg">Belum ada pemesanan futsal masuk.</p>
          <p class="text-slate-500 text-sm mt-1">Status ketersediaan lapangan masih kosong total.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/20">
                <th class="px-6 py-4">ID / Penyewa</th>
                <th class="px-6 py-4">Lapangan</th>
                <th class="px-6 py-4">Jadwal Sewa</th>
                <th class="px-6 py-4">Durasi & Biaya</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800 text-sm">
              {#each bookings as booking}
                {@const cost = booking.lapanganHarga * booking.durasi}
                <tr class="hover:bg-slate-950/10 transition-colors">
                  <!-- User Details -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                      <span class="font-bold text-white text-sm">{booking.userName || 'Penyewa'}</span>
                      <span class="text-slate-500 text-xs">{booking.userEmail || '-'}</span>
                      <span class="text-[10px] text-slate-600 font-mono mt-0.5">ID Booking: #BK-{booking.id}</span>
                    </div>
                  </td>

                  <!-- Court details -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="font-semibold text-slate-200">{booking.lapanganNama}</span>
                  </td>

                  <!-- Booking Schedule -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                      <span class="text-slate-200 font-medium">{booking.tanggal.substring(0, 10)}</span>
                      <span class="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                        <Clock class="w-3.5 h-3.5 text-emerald-500" /> {booking.jam.substring(0, 5)} WIB
                      </span>
                    </div>
                  </td>

                  <!-- Cost info -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                      <span class="font-bold text-emerald-400">Rp {cost.toLocaleString('id-ID')}</span>
                      <span class="text-slate-500 text-xs">{booking.durasi} Jam (Rp {booking.lapanganHarga.toLocaleString('id-ID')}/jm)</span>
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    {#if booking.status === 'Menunggu Pembayaran'}
                      <span class="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        Menunggu Bayar
                      </span>
                    {:else if booking.status === 'Lunas'}
                      <span class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        Lunas
                      </span>
                    {:else}
                      <span class="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        Dibatalkan
                      </span>
                    {/if}
                  </td>

                  <!-- Action Buttons -->
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex items-center justify-center gap-2">
                      {#if actionLoadingId === booking.id}
                        <div class="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                      {:else}
                        <!-- Pay Button -->
                        <button
                          disabled={booking.status === 'Lunas'}
                          onclick={() => updateStatus(booking.id, 'Lunas')}
                          class="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-slate-950 font-bold transition-all"
                          title="Tandai Lunas"
                        >
                          <Check class="w-4 h-4" />
                        </button>
                        
                        <!-- Pending Button -->
                        <button
                          disabled={booking.status === 'Menunggu Pembayaran'}
                          onclick={() => updateStatus(booking.id, 'Menunggu Pembayaran')}
                          class="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-bold transition-all"
                          title="Kembalikan Menunggu Pembayaran"
                        >
                          <Clock class="w-4 h-4" />
                        </button>

                        <!-- Cancel Button -->
                        <button
                          disabled={booking.status === 'Dibatalkan'}
                          onclick={() => updateStatus(booking.id, 'Dibatalkan')}
                          class="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 text-white font-bold transition-all"
                          title="Batalkan Booking"
                        >
                          <X class="w-4 h-4" />
                        </button>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>
