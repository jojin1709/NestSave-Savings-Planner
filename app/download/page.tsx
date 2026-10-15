import type { Metadata } from "next";
import Link from "next/link";
import NestSaveLogo from "../../components/NestSaveLogo";

export const metadata: Metadata = {
  title: "NestSave for Android — 100% Offline Savings Goal Planner",
  description: "Download the native NestSave Android app. 100% offline-first, biometric security, Bank RD & FD calculators, Room database, and zero cloud tracking.",
  openGraph: {
    title: "NestSave for Android — Private Wealth Engine",
    description: "Pure native Kotlin & Jetpack Compose savings goal planner. Zero cloud, zero trackers.",
    url: "https://nestsave.vercel.app/download",
    siteName: "NestSave",
  },
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-emerald-500/10 via-emerald-900/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] bg-emerald-600/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090d]/80 border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <NestSaveLogo size={36} className="rounded-xl shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-200" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  NestSave
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Android Native
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:block">Private Financial Vault</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-zinc-800/60 transition-all border border-transparent hover:border-zinc-700/60"
            >
              Open Web App →
            </Link>
            <a
              href="https://github.com/jojin1709/NestSave-Savings-Planner"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* ========================================================= */}
        {/* HERO SECTION: ASYMMETRIC GRID WITH REALISTIC DEVICE PREVIEW */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pb-20 border-b border-zinc-800/80">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>NestSave Android v1.0.0 Released</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-mono text-[11px]">ARM64 &amp; x86_64</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-black tracking-tight text-white leading-[1.08]">
              Your savings.<br />
              Your device.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Zero cloud.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed">
              The deterministic personal finance engine built natively in Kotlin and Jetpack Compose. Plans savings goals, calculates Indian Bank RDs with quarterly compounding, and recalibrates behind-schedule goals — with hardware biometric lock and zero network trackers.
            </p>

            {/* Download Action Suite */}
            <div className="mt-8 w-full max-w-xl flex flex-col sm:flex-row gap-4 items-stretch">
              {/* Primary APK Download Button */}
              <a
                href="/downloads/NestSave.apk"
                download="NestSave-v1.0.0.apk"
                className="flex-1 group relative px-6 py-4 rounded-2xl bg-gradient-to-b from-emerald-500 to-[#0d684c] hover:from-emerald-400 hover:to-[#0f7a59] text-white font-bold text-base shadow-xl shadow-emerald-950/80 hover:shadow-emerald-900/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 flex items-center justify-between border border-emerald-400/30"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold tracking-tight">Download APK</div>
                    <div className="text-[11px] text-emerald-100/80 font-mono font-medium">v1.0.0 • 12.2 MB • Release Build</div>
                  </div>
                </div>
                <span className="text-xs bg-white/15 px-2 py-1 rounded-lg text-white font-mono">.apk</span>
              </a>

              {/* GitHub Releases secondary */}
              <a
                href="https://github.com/jojin1709/NestSave-Savings-Planner/releases/tag/v1.0.0"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Releases</span>
              </a>
            </div>

            {/* Scan with Phone QR Code Drawer */}
            <div className="mt-8 w-full max-w-xl p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center gap-4">
              <div className="p-1 rounded-xl bg-white flex-shrink-0 shadow-md">
                <img
                  src="/qr-download.svg"
                  alt="Scan QR code with phone camera to download NestSave APK"
                  className="w-16 h-16 rounded-lg"
                />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Scan to download on Android</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">Camera Scan</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Open your phone camera to download the APK file directly to your phone without transferring cables.
                </p>
              </div>
            </div>

            {/* Trust Matrix */}
            <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Zero Internet Permissions</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Hardware Biometric Protected</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                </svg>
                <span>Room SQLite Database</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Realistic Android Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
              
              {/* Ambient Glow behind phone */}
              <div className="absolute inset-0 bg-emerald-500/20 blur-[90px] rounded-full -z-10" />

              {/* Titanium Device Frame */}
              <div className="relative rounded-[44px] p-3 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border-2 border-zinc-600/40 shadow-2xl shadow-black/90">
                
                {/* Inner Screen Bezel */}
                <div className="relative rounded-[36px] bg-[#000000] overflow-hidden border border-zinc-800 text-white font-sans text-left select-none flex flex-col h-[680px]">
                  
                  {/* Status Bar */}
                  <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-white text-[11px]">9:41</span>
                    {/* Punch hole camera */}
                    <div className="w-4 h-4 rounded-full bg-zinc-950 border border-zinc-800 mx-auto" />
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <div className="w-4 h-2 rounded-sm border border-zinc-400 p-0.5">
                        <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* App Bar */}
                  <div className="px-5 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <NestSaveLogo size={30} className="rounded-lg shadow-sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm tracking-tight text-white">NestSave</span>
                          <span className="px-1.5 py-0.2 rounded-full bg-orange-500/10 text-orange-400 text-[9px] font-bold">
                            🔥 7d
                          </span>
                        </div>
                        <div className="text-[9px] text-zinc-400">Zero Cloud Vault</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-emerald-400">
                        ₹
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                        🔒
                      </div>
                    </div>
                  </div>

                  {/* App Screen Body */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-none">
                    
                    {/* Total Wealth Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-lg">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Total Portfolio Saved</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+₹15,000 this mo</span>
                      </div>
                      <div className="text-2xl font-black text-white mt-1">₹2,35,000</div>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Target: ₹4,50,000</span>
                        <span className="text-emerald-400 font-bold">52% on track</span>
                      </div>
                      <div className="mt-1.5 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[52%]" />
                      </div>
                    </div>

                    {/* Active Goal 1: Emergency Buffer (On Track) */}
                    <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">
                            🛡️
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Emergency Fortress (6 Mo)</div>
                            <div className="text-[10px] text-zinc-400">Target: ₹1,50,000</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          On Track
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400">Saved: <strong className="text-white">₹95,000</strong></span>
                        <span className="text-emerald-400 font-mono">₹6,250/mo needed</span>
                      </div>
                      <div className="mt-1 w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[63%]" />
                      </div>
                    </div>

                    {/* Active Goal 2: MacBook Pro (Behind Schedule -> 1-Click Recalibrate Pill) */}
                    <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 bg-amber-950/10 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm font-bold">
                            💻
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">MacBook Pro M3 Max</div>
                            <div className="text-[10px] text-zinc-400">Target: ₹1,40,000</div>
                          </div>
                        </div>
                        <button className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 animate-pulse">
                          Recalibrate ⚡
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400">Saved: <strong className="text-white">₹65,000</strong></span>
                        <span className="text-amber-400 font-mono">Behind by ₹12,000</span>
                      </div>
                      <div className="mt-1 w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full w-[46%]" />
                      </div>
                    </div>

                    {/* Active Goal 3: Bank RD (Quarterly Compounding) */}
                    <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm font-bold">
                            🏦
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Bank RD (Quarterly Comp.)</div>
                            <div className="text-[10px] text-zinc-400">₹5,000/mo @ 7.1% p.a.</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                          +₹4,120 Interest
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400">Maturity: <strong className="text-white">₹64,120</strong></span>
                        <span className="text-zinc-500 font-mono">12 Months</span>
                      </div>
                    </div>

                  </div>

                  {/* Android Bottom Navigation */}
                  <div className="py-2.5 px-6 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-500">
                    <div className="flex flex-col items-center gap-1 text-emerald-400 font-bold">
                      <span className="text-xs">🏠</span>
                      <span>Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">📊</span>
                      <span>Analytics</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">📉</span>
                      <span>Expenses</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">🏆</span>
                      <span>Badges</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">⚙️</span>
                      <span>Settings</span>
                    </div>
                  </div>

                  {/* Android Gesture Bar */}
                  <div className="pb-2 pt-1 flex justify-center bg-zinc-950">
                    <div className="w-24 h-1 bg-zinc-600 rounded-full" />
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* SECTION 2: 4 DEEP DIVE ARCHITECTURE CARDS                  */}
        {/* ========================================================= */}
        <section className="py-20 border-b border-zinc-800/80 text-left">
          <div className="max-w-3xl mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Engineered for absolute privacy. Built for real financial goals.
            </h2>
            <p className="mt-3 text-base text-zinc-400">
              Unlike cloud-hosted trackers that monetize your financial habits, NestSave executes 100% of its algorithms directly on your phone&apos;s processor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Indian Banking Math */}
            <div className="p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-5">
                  🏦
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Indian Banking Suite (Quarterly Compounding)</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Bank Recurring Deposits (RD) and Fixed Deposits (FD) in India compound interest every 3 months. NestSave incorporates exact quarterly compounding formulas:
                </p>
                <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                  A = P × [(1 + r/4)^(4n) - 1] / [1 - (1 + r/4)^(-1/3)]
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span>1-Click Convert RD to Goal</span>
                <span className="text-emerald-400 font-semibold">Zero Math Error</span>
              </div>
            </div>

            {/* Card 2: 1-Click Plan Recalibration */}
            <div className="p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-5">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-white mb-2">1-Click Plan Recalibration</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Life happens. Unexpected expenses pull goals off-track. Instead of abandoning your plan, tap Recalibrate to choose between two deterministic outcomes:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <div className="font-bold text-white">Keep Deadline</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Raises monthly target to still hit the original date.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                    <div className="font-bold text-white">Keep Savings Pace</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Extends deadline realistically to your actual pace.</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span>Prevents Goal Burnout</span>
                <span className="text-amber-400 font-semibold">Adaptive Algorithm</span>
              </div>
            </div>

            {/* Card 3: Salary Day Batch Deposit */}
            <div className="p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xl mb-5">
                  💼
                </div>
                <h3 className="text-xl font-bold text-white mb-2">1-Tap Salary Day Batch Allocator</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  On the 1st of every month or payday, manually distributing funds across 6 different goals is tedious. NestSave opens a single batch allocation modal:
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-zinc-800">
                    <span className="text-zinc-300">Emergency Fund</span>
                    <span className="text-emerald-400 font-bold">₹5,000</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-zinc-800">
                    <span className="text-zinc-300">Vehicle Down Payment</span>
                    <span className="text-emerald-400 font-bold">₹10,000</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span>1 Tap for All Goals</span>
                <span className="text-teal-400 font-semibold">Automates Payday</span>
              </div>
            </div>

            {/* Card 4: Hardware Biometric Security */}
            <div className="p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-5">
                  🔐
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Hardware Biometrics &amp; AES-GCM Vault</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  Your net worth and balances are confidential. NestSave utilizes Android&apos;s hardware BiometricPrompt (fingerprint &amp; face unlock) before decrypting local vaults.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                  <div>• Key Derivation: <span className="text-white font-mono">PBKDF2 with 100,000 iterations</span></div>
                  <div>• Vault Encryption: <span className="text-white font-mono">AES-GCM 256-bit</span></div>
                  <div>• Telemetry: <span className="text-emerald-400 font-mono">0 Bytes Outbound</span></div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span>Client-Side Master Key</span>
                <span className="text-indigo-400 font-semibold">Zero-Knowledge</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: HEAD-TO-HEAD COMPARISON TABLE                  */}
        {/* ========================================================= */}
        <section className="py-20 border-b border-zinc-800/80 text-left">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl font-extrabold text-white">Why Offline-First Beats Cloud Finance Apps</h2>
            <p className="mt-2 text-sm text-zinc-400">Comparing NestSave against traditional cloud-hosted personal finance tools.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/30">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/70 text-zinc-400 font-bold">
                  <th className="py-4 px-6">Capability</th>
                  <th className="py-4 px-6 text-emerald-400 font-extrabold">NestSave Native Android</th>
                  <th className="py-4 px-6 text-zinc-400">Typical Cloud Finance Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">Data Storage Location</td>
                  <td className="py-4 px-6 text-emerald-400 font-medium">100% on your device (SQLite Room)</td>
                  <td className="py-4 px-6 text-rose-400">Company cloud database (AWS / Firebase)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">Bank Credentials Needed</td>
                  <td className="py-4 px-6 text-emerald-400 font-medium">Never (Zero bank sync required)</td>
                  <td className="py-4 px-6 text-rose-400">Mandatory Plaid / Account Aggregator sync</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">Requires Internet Connection</td>
                  <td className="py-4 px-6 text-emerald-400 font-medium">No (Works entirely in Airplane Mode)</td>
                  <td className="py-4 px-6 text-rose-400">Yes (Fails without active data connection)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">Advertisements &amp; Loan Upsells</td>
                  <td className="py-4 px-6 text-emerald-400 font-medium">Zero ads, zero credit card prompts</td>
                  <td className="py-4 px-6 text-rose-400">Aggressive credit score &amp; loan product pitches</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">Device Permissions</td>
                  <td className="py-4 px-6 text-emerald-400 font-medium">0 internet permissions</td>
                  <td className="py-4 px-6 text-rose-400">Full network, contacts, location, telemetry</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-white">Data Portability</td>
                  <td className="py-4 px-6 text-emerald-400 font-medium">Password-Encrypted AES-GCM JSON / CSV</td>
                  <td className="py-4 px-6 text-rose-400">Locked inside proprietary ecosystem</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: 3-STEP VISUAL INSTALLATION GUIDE               */}
        {/* ========================================================= */}
        <section className="py-20 border-b border-zinc-800/80 text-left">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-extrabold text-white">Installing NestSave on Android</h2>
            <p className="mt-2 text-sm text-zinc-400">Follow these 3 quick steps to install the native release package.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-white text-base mb-2">Download APK</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tap <strong className="text-emerald-400">Download Direct APK</strong> or scan the QR code using your phone camera. File size is ~12.2 MB.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-white text-base mb-2">Allow Unknown Apps</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When prompted by Android, toggle <strong className="text-white">&ldquo;Allow from this source&rdquo;</strong> for your browser. This is standard for apps distributed directly without Google Play.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-white text-base mb-2">Tap Install &amp; Launch</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tap <strong className="text-white">Install</strong>. NestSave is now on your home screen ready to run 100% offline with full biometric protection.
              </p>
            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: TECHNICAL SPECIFICATIONS & CHECKSUMS           */}
        {/* ========================================================= */}
        <section className="py-16 text-left">
          <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Release Package Specifications</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">v1.0.0</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Signed release build built with Android Gradle Plugin 8.9 and Kotlin 2.1. Compatible with all modern Android smartphones and foldables.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-zinc-400">
                <div>Package: <span className="text-white">com.nestsave</span></div>
                <div>Min SDK: <span className="text-white">Android 8.0 (API 26)</span></div>
                <div>Target SDK: <span className="text-white">Android 15 (API 35)</span></div>
                <div>16 KB Pages: <span className="text-emerald-400">Verified Compatible</span></div>
              </div>
              <div className="mt-3 p-2.5 rounded-xl bg-black/50 border border-zinc-800/80 font-mono text-[10px] text-zinc-400 max-w-xl flex items-center gap-2">
                <span className="text-zinc-500 font-bold uppercase">SHA-256:</span>
                <span className="text-emerald-400 truncate select-all">f3f9f25f401af468998275f6a959ac119dc8b719069e9740c8ccbf41e0005fa4</span>
              </div>
            </div>

            <a
              href="/downloads/NestSave.apk"
              download="NestSave-v1.0.0.apk"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wide transition uppercase flex-shrink-0"
            >
              Get NestSave.apk
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 px-4 text-center text-xs text-zinc-500 bg-[#050608]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NestSaveLogo size={22} />
            <span className="font-bold text-zinc-300">NestSave</span>
            <span>— Private, Offline-First Savings Goal Planner</span>
          </div>
          <div>
            Built with pride by <a href="https://github.com/jojin1709" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white underline">Jojin John</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
