<script lang="ts">
  import { BACKEND_URL } from '$lib/auth.svelte.js';
  import { goto } from '$app/navigation';
  import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from '@lucide/svelte';

  let nama = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  
  let loading = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  async function handleRegister(e: SubmitEvent) {
    e.preventDefault();
    if (!nama || !email || !password || !confirmPassword) {
      errorMsg = 'Semua kolom wajib diisi';
      return;
    }

    if (password !== confirmPassword) {
      errorMsg = 'Password dan konfirmasi password tidak cocok';
      return;
    }

    if (password.length < 6) {
      errorMsg = 'Password minimal harus 6 karakter';
      return;
    }

    loading = true;
    errorMsg = '';
    successMsg = '';

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nama, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.pesan || 'Registrasi gagal');
      }

      successMsg = 'Registrasi akun berhasil! Mengalihkan ke halaman login...';
      nama = '';
      email = '';
      password = '';
      confirmPassword = '';

      setTimeout(() => {
        goto('/login');
      }, 2000);
    } catch (err: any) {
      errorMsg = err.message || 'Terjadi kesalahan koneksi';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Registrasi Akun - Arena Futsal Hub</title>
</svelte:head>

<div class="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
  <!-- Glowing Background Accents -->
  <div class="absolute w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl -top-20 -right-20"></div>
  <div class="absolute w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl -bottom-20 -left-20"></div>

  <div class="max-w-md w-full space-y-8 relative z-10">
    <div class="text-center">
      <h2 class="mt-6 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Mulai Bermain Futsal
      </h2>
      <p class="mt-2 text-sm text-slate-400">
        Buat akun gratis Anda untuk memesan lapangan futsal secara real-time.
      </p>
    </div>

    <!-- Register Card -->
    <div class="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-950">
      {#if errorMsg}
        <div class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle class="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      {/if}

      {#if successMsg}
        <div class="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 class="w-5 h-5 flex-shrink-0 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      {/if}

      <form class="space-y-5" onsubmit={handleRegister}>
        <div>
          <label for="nama" class="block text-sm font-semibold text-slate-300 mb-1.5">Nama Lengkap</label>
          <div class="relative rounded-xl shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <User class="h-5 w-5" />
            </div>
            <input
              id="nama"
              type="text"
              required
              bind:value={nama}
              class="block w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm transition-all"
              placeholder="Nama Lengkap Anda"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-semibold text-slate-300 mb-1.5">Alamat Email</label>
          <div class="relative rounded-xl shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Mail class="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              required
              bind:value={email}
              class="block w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm transition-all"
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
          <div class="relative rounded-xl shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Lock class="h-5 w-5" />
            </div>
            <input
              id="password"
              type="password"
              required
              bind:value={password}
              class="block w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm transition-all"
              placeholder="Minimal 6 karakter"
            />
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-semibold text-slate-300 mb-1.5">Konfirmasi Password</label>
          <div class="relative rounded-xl shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Lock class="h-5 w-5" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              required
              bind:value={confirmPassword}
              class="block w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-sm transition-all"
              placeholder="Ulangi password Anda"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-950 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-emerald-500/20 mt-2"
        >
          {#if loading}
            <div class="w-5 h-5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
          {:else}
            <span class="flex items-center gap-1.5">
              <UserPlus class="w-4 h-4" /> Daftar Akun
            </span>
          {/if}
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-slate-800/80 text-center text-sm text-slate-400">
        Sudah memiliki akun? 
        <a href="/login" class="font-bold text-emerald-400 hover:text-emerald-300 transition-colors ml-1">
          Masuk Sekarang
        </a>
      </div>
    </div>
  </div>
</div>
