<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { auth } from '$lib/auth.svelte.js';
  import { LogOut, User, Shield, Calendar, Home, Award } from '@lucide/svelte';
  import { onMount } from 'svelte';

  let { children } = $props();

  onMount(() => {
    auth.init();
  });

  function handleSignOut() {
    auth.clearSession();
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Arena Futsal Hub - Reservasi Lapangan Online</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
  <!-- Navigation Header -->
  <header class="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 group">
          <div class="bg-emerald-500 text-slate-950 p-2 rounded-lg font-bold group-hover:scale-105 transition-transform duration-300">
            <Award class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span class="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            FUTSALHUB
          </span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <a href="/" class="text-slate-300 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1.5">
            <Home class="w-4 h-4" /> Home
          </a>
          
          {#if auth.user}
            <a href="/dashboard" class="text-slate-300 hover:text-emerald-400 font-medium transition-colors flex items-center gap-1.5">
              <Calendar class="w-4 h-4" /> Booking Lapangan
            </a>
            {#if auth.user.role === 'admin'}
              <a href="/admin" class="text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1.5 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                <Shield class="w-4 h-4" /> Admin Panel
              </a>
            {/if}
          {/if}
        </nav>

        <!-- User Actions / Session state -->
        <div class="flex items-center gap-3">
          {#if auth.loading}
            <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
          {:else if auth.user}
            <div class="hidden sm:flex flex-col text-right">
              <span class="text-sm font-semibold text-slate-200">{auth.user.nama}</span>
              <span class="text-xs text-slate-400 capitalize">{auth.user.role}</span>
            </div>
            
            <!-- User avatar icon / Dashboard button -->
            <a href="/dashboard" class="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-full transition-colors relative group" title="Dashboard">
              <User class="w-4 h-4" />
            </a>

            <!-- Log out -->
            <button 
              onclick={handleSignOut}
              class="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-rose-900/30"
              title="Sign Out"
            >
              <LogOut class="w-4 h-4" /> <span class="hidden sm:inline">Keluar</span>
            </button>
          {:else}
            <a 
              href="/login" 
              class="text-slate-300 hover:text-emerald-400 font-semibold text-sm px-4 py-2 transition-colors"
            >
              Masuk
            </a>
            <a 
              href="/register" 
              class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 shadow-md shadow-emerald-500/20"
            >
              Daftar
            </a>
          {/if}
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile navigation helper bar -->
  {#if auth.user}
    <div class="md:hidden bg-slate-900 border-b border-slate-800 py-2.5 px-4 flex justify-around text-sm font-medium">
      <a href="/" class="text-slate-300 hover:text-emerald-400 flex items-center gap-1">
        <Home class="w-4 h-4" /> Home
      </a>
      <a href="/dashboard" class="text-slate-300 hover:text-emerald-400 flex items-center gap-1">
        <Calendar class="w-4 h-4" /> Booking
      </a>
      {#if auth.user.role === 'admin'}
        <a href="/admin" class="text-rose-400 hover:text-rose-300 flex items-center gap-1">
          <Shield class="w-4 h-4" /> Admin
        </a>
      {/if}
    </div>
  {/if}

  <!-- Main Content -->
  <main class="flex-grow">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="bg-slate-950 border-t border-slate-900 py-12 sm:py-16 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <div class="bg-emerald-500 text-slate-950 p-1.5 rounded-lg font-bold">
              <Award class="w-4 h-4" />
            </div>
            <span class="text-lg font-bold tracking-wider text-white">FUTSALHUB</span>
          </div>
          <p class="text-sm text-slate-400 max-w-sm">
            Rasakan sensasi bermain futsal di lapangan bertaraf internasional dengan fasilitas penunjang premium dan kemudahan reservasi online 24 jam.
          </p>
        </div>
        
        <div>
          <h3 class="text-slate-200 font-semibold mb-4 text-sm tracking-wider uppercase">Kontak Kami</h3>
          <p class="text-sm text-slate-400 mb-2">Jl. Arena Olahraga No. 42, Surabaya, Jawa Timur</p>
          <p class="text-sm text-slate-400 mb-2">WhatsApp: +62 812-3456-7890</p>
          <p class="text-sm text-slate-400">Email: info@futsalhub.com</p>
        </div>

        <div>
          <h3 class="text-slate-200 font-semibold mb-4 text-sm tracking-wider uppercase">Jam Operasional</h3>
          <p class="text-sm text-slate-400 mb-2">Setiap Hari: 07:00 - 23:00 WIB</p>
          <p class="text-xs text-slate-500">Reservasi online dapat diakses 24 jam penuh untuk mengecek ketersediaan jadwal lapangan.</p>
        </div>
      </div>
      
      <div class="border-t border-slate-900 mt-12 pt-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} FutsalHub. All rights reserved.
      </div>
    </div>
  </footer>
</div>
