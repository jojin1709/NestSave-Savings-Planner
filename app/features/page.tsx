import type { Metadata } from "next";
import Link from "next/link";
import NestSaveLogo from "../../components/NestSaveLogo";

export const metadata: Metadata = {
  title: "Features — NestSave Savings Planner & Wealth Engine",
  description: "Explore all features of NestSave: 100% offline-first storage, Indian Bank RD/FD calculators, biometric vault lock, 1-click plan recalibration, and salary-day batch allocation.",
  openGraph: {
    title: "NestSave Features — Private, Deterministic Wealth Engine",
    description: "Zero cloud tracking, hardware biometric lock, Indian bank compound calculators, and automated plan recalibration.",
    url: "https://nestsave.vercel.app/features",
    siteName: "NestSave",
  },
};

export default function FeaturesPage() {
  const featureCategories = [
    {
      category: "Privacy & Vault Security",
      tagline: "Your financial roadmap belongs on your hardware, not in someone else's cloud.",
      icon: "🔒",
      features: [
        {
          title: "100% Local-First & Zero Cloud Tracking",
          desc: "NestSave never transmits your financial balances, account goals, or transaction history to any remote server. Zero telemetry, zero analytics scripts, and zero ads.",
          badge: "Core Architecture",
          highlight: "Zero Network Tracking",
          codePreview: "Database: Room SQLite (Android) / Encrypted Web Storage"
        },
        {
          title: "Hardware Biometric Vault Lock",
          desc: "Secure your financial goals behind native Android BiometricPrompt (fingerprint and 3D facial recognition) and WebAuthn. The entire UI locks automatically when the app is backgrounded.",
          badge: "Android & Web",
          highlight: "BiometricPrompt API",
          codePreview: "BiometricManager.Authenticators.BIOMETRIC_STRONG"
        },
        {
          title: "Client-Side AES-GCM 256 Vault Backups",
          desc: "Export encrypted JSON backup archives protected with PBKDF2 key derivation (100,000 iterations). Move your financial data between Android and Web with zero cloud intermediaries.",
          badge: "Cryptography",
          highlight: "AES-256-GCM / PBKDF2",
          codePreview: "crypto.subtle.encrypt({ name: 'AES-GCM' })"
        }
      ]
    },
    {
      category: "Financial Calculators & Indian Banking",
      tagline: "Mathematical precision built for the nuances of Indian savings instruments.",
      icon: "📐",
      features: [
        {
          title: "Indian Bank Recurring Deposit (RD) Engine",
          desc: "Most generic calculators use simple interest. NestSave implements the official Indian Banking compound interest standard with quarterly compounding and monthly installments.",
          badge: "Banking Standard",
          highlight: "Quarterly Compounding",
          codePreview: "A = P * ((1 + r/400)^(4n) - 1) / (1 - (1 + r/400)^(-1/3))"
        },
        {
          title: "Fixed Deposit (FD) Maturity Projector",
          desc: "Calculate precise maturity values for cumulative and non-cumulative term deposits across 7-day to 10-year tenures with real post-tax yield analysis.",
          badge: "Compound Engine",
          highlight: "Cumulative & Payouts",
          codePreview: "A = P * (1 + r/n)^(n*t)"
        },
        {
          title: "Real Purchasing Power & Inflation Adjuster",
          desc: "A ₹10 Lakh goal in 5 years won't buy ₹10 Lakh worth of goods today. NestSave factors in inflation (default 6% CPI) to calculate the actual future purchasing power needed.",
          badge: "Macroeconomics",
          highlight: "CPI Adjustments",
          codePreview: "FutureValue = TargetCorpus / ((1 + CPI)^Years)"
        }
      ]
    },
    {
      category: "Intelligent Goal Tracking & Recalibration",
      tagline: "Life is unpredictable. Your savings planner shouldn't break when your plan changes.",
      icon: "⚡",
      features: [
        {
          title: "1-Click Plan Recalibration Engine",
          desc: "Fell behind on a goal? Instead of abandoning your target, NestSave computes dynamic recalibration scenarios: extend your target date by X months or adjust monthly savings by ₹X to finish on time.",
          badge: "Smart Engine",
          highlight: "Shortfall Elimination",
          codePreview: "NewMonthlyReq = (TargetAmount - CurrentAmount) / MonthsRemaining"
        },
        {
          title: "Salary-Day Batch Allocator",
          desc: "On payday, distribute your total savings pool across all active goals with a single click. Allocations automatically prioritize critical emergency funds before lifestyle goals.",
          badge: "Workflow Automation",
          highlight: "Priority Weighted",
          codePreview: "allocateByWeight(salaryPool, goals.filter(g => g.active))"
        },
        {
          title: "Milestone Streaks & Badges",
          desc: "Habitual savings momentum is reinforced with active streak counters (🔥 7d, 14d, 30d) and unlocked achievement badges like First Deposit, Halfway Titan, and Master Recalibrator.",
          badge: "Habit Engine",
          highlight: "Dopamine Momentum",
          codePreview: "StreakState(activeStreak = 7, longest = 14)"
        }
      ]
    },
    {
      category: "Native Performance & Delivery",
      tagline: "Lightweight, hyper-responsive software built with modern platform standards.",
      icon: "📱",
      features: [
        {
          title: "Native Android 15 & 16 KB Page Support",
          desc: "Built with Kotlin and Jetpack Compose. Ready for Android 15 and 16 KB page-size memory architectures. Starts in under 200ms with smooth 120 FPS animations.",
          badge: "Kotlin & Compose",
          highlight: "16 KB Page Aligned",
          codePreview: "Android SDK 34 • compileSdk 34 • Kotlin 2.0"
        },
        {
          title: "In-App Automated Updates",
          desc: "Installed outside the Google Play Store? NestSave includes an integrated update engine that checks latest releases via Vercel edge and GitHub, allowing 1-tap in-app APK upgrades.",
          badge: "Self-Updating",
          highlight: "Zero Google Play Dependency",
          codePreview: "UpdateManager.checkForUpdates() -> 1-Tap Install"
        },
        {
          title: "Progressive Web App (PWA) Offline Cache",
          desc: "The web companion app works 100% offline via modern service worker caching. Install it to your home screen or desktop without visiting any app store.",
          badge: "PWA Offline",
          highlight: "Desktop & Mobile Web",
          codePreview: "ServiceWorker: cache-first with local persistence"
        }
      ]
    }
  ];

  const comparisonPoints = [
    { feature: "Offline-First (Zero Internet Required)", nestsave: "Yes (100% Offline)", cloudApps: "No (Server-locked)", spreadsheets: "Yes" },
    { feature: "Privacy & Zero Telemetry Tracking", nestsave: "Yes (0 Trackers)", cloudApps: "No (Targeted Ads / Data Brokerage)", spreadsheets: "Yes" },
    { feature: "Hardware Biometric Vault Lock", nestsave: "Yes (Native BiometricPrompt)", cloudApps: "Requires Cloud Login", spreadsheets: "No" },
    { feature: "Indian Bank RD/FD Quarterly Compounding", nestsave: "Built-in Exact Formulas", cloudApps: "Generic / Missing", spreadsheets: "Manual Complex Formulas" },
    { feature: "1-Click Plan Recalibration Engine", nestsave: "Automated Algorithmic", cloudApps: "Manual Edit Only", spreadsheets: "Manual Math" },
    { feature: "Salary-Day Batch Allocation", nestsave: "1-Tap Multi-Goal", cloudApps: "Manual Goal-by-Goal", spreadsheets: "Complex Formulas" },
    { feature: "Client-Side Encrypted Export / Import", nestsave: "Yes (AES-GCM 256)", cloudApps: "CSV Plaintext or Locked", spreadsheets: "Unencrypted" },
    { feature: "Price & Cost", nestsave: "100% Free & Open-Source (MIT)", cloudApps: "$5 - $15/month subscription", spreadsheets: "Free" }
  ];

  return (
    <div className="min-h-screen bg-[#07090d] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-emerald-500/10 via-emerald-900/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] bg-emerald-600/5 blur-[160px] rounded-full" />
        <div className="absolute top-[70%] -left-40 w-[600px] h-[600px] bg-teal-600/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090d]/85 border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <NestSaveLogo size={36} className="rounded-xl shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-200" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  NestSave
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Features
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:block">Deterministic Wealth Engine</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-zinc-800/60 transition-all"
            >
              Web App
            </Link>
            <Link
              href="/download"
              className="text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Download APK</span>
              <span className="text-[10px] bg-emerald-400/20 px-1 py-0.2 rounded font-mono">v1.0.0</span>
            </Link>
            <a
              href="https://github.com/jojin1709/NestSave-Savings-Planner"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 transition-all"
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
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        
        {/* ========================================================= */}
        {/* HERO TITLE */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto pb-16 sm:pb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
            <span>✨ Complete Architectural Overview</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Engineered for privacy.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Built for precision.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Every feature in NestSave is designed with a strict zero-cloud philosophy. From Indian Bank quarterly compounding to hardware biometric locks, experience uncompromising personal finance.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all"
            >
              Launch Web Planner →
            </Link>
            <Link
              href="/download"
              className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2"
            >
              <span>Download Android APK</span>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-emerald-400 font-mono">12.3 MB</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PLATFORM SHOWCASE BANNER IMAGE */}
        {/* ========================================================= */}
        <div className="relative mx-auto max-w-6xl pb-20">
          <div className="relative rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-zinc-800/90 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl shadow-emerald-950/70 overflow-hidden group">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-emerald-500/15 blur-[120px] -z-10 rounded-full" />
            
            <img
              src="/features-banner.jpg"
              alt="NestSave Multi-Device Platform — Expense Tracker, Web Dashboard, Financial Analytics & Insights, and Savings Streaks"
              className="w-full h-auto rounded-2xl object-cover shadow-2xl border border-zinc-800/80 transition-transform duration-500 group-hover:scale-[1.008]"
              loading="eager"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* WHAT'S NEW IN THIS UPDATE (v1.0.0) SECTION */}
        {/* ========================================================= */}
        <div className="relative mx-auto max-w-6xl pb-24">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
              <span>🚀 Latest Update (v1.0.0)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              What&apos;s New in this Release?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400">
              Major new features, native Android architecture, and local-first personal finance calculators.
            </p>
          </div>

          <div className="relative rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-zinc-800/90 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl shadow-emerald-950/70 overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/15 blur-[120px] -z-10 rounded-full" />
            <img
              src="/whats-new-v100.jpg"
              alt="NestSave v1.0.0 Update Infographic — What's New in this Update"
              className="w-full h-auto rounded-2xl object-cover shadow-2xl border border-zinc-800/80 transition-transform duration-500 group-hover:scale-[1.008]"
              loading="lazy"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* DETAILED FEATURE CATEGORIES */}
        {/* ========================================================= */}
        <div className="space-y-20">
          {featureCategories.map((group, groupIdx) => (
            <div key={groupIdx} className="relative">
              {/* Category Header */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-xl">{group.icon}</span>
                    <span>Category 0{groupIdx + 1}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {group.category}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md sm:text-right">
                  {group.tagline}
                </p>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group relative p-6 rounded-2xl bg-gradient-to-b from-zinc-900/70 to-zinc-950/90 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono">
                          {feature.badge}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {feature.highlight}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {feature.title}
                      </h3>

                      <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/60">
                      <div className="text-[10px] font-mono text-zinc-500 truncate bg-black/40 px-3 py-2 rounded-lg border border-zinc-900">
                        <code>{feature.codePreview}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* COMPARISON MATRIX: NESTSAVE VS OTHER TOOLS */}
        {/* ========================================================= */}
        <div className="mt-28 pt-16 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Honest Comparison
            </span>
            <h2 className="text-3xl font-black text-white mt-4 tracking-tight">
              Why NestSave vs Cloud Apps or Spreadsheets?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Most personal finance apps monetize your private balance sheets. Here is how NestSave differs.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/70 shadow-2xl">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-semibold">
                  <th className="py-4 px-6 text-zinc-300">Feature &amp; Capability</th>
                  <th className="py-4 px-6 text-emerald-400 font-bold bg-emerald-950/30">NestSave (Local Engine)</th>
                  <th className="py-4 px-6">Generic Cloud Apps</th>
                  <th className="py-4 px-6">Manual Excel / Sheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {comparisonPoints.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-white">{row.feature}</td>
                    <td className="py-3.5 px-6 font-bold text-emerald-400 bg-emerald-950/20 flex items-center gap-1.5">
                      <span>✓</span>
                      <span>{row.nestsave}</span>
                    </td>
                    <td className="py-3.5 px-6 text-zinc-400">{row.cloudApps}</td>
                    <td className="py-3.5 px-6 text-zinc-400">{row.spreadsheets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CALL TO ACTION CARD */}
        {/* ========================================================= */}
        <div className="mt-28 p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-zinc-900 to-zinc-950 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Take back ownership of your financial roadmap.
            </h2>
            <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
              Available instantly on the web with zero login, or install the native Android APK for hardware-secured offline biometric peace of mind.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-950/80 transition-all hover:-translate-y-0.5"
              >
                Open Web App (No Login) →
              </Link>
              <Link
                href="/download"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm border border-zinc-700/80 transition-all flex items-center justify-center gap-2"
              >
                <span>Download Android APK</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">12.3 MB</span>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#07090d] py-10 px-4 sm:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <NestSaveLogo size={24} className="rounded-lg opacity-80" />
            <span className="text-zinc-400 font-semibold">NestSave — Local-First Financial Engine</span>
            <span>•</span>
            <span className="font-mono text-zinc-500">MIT Open Source</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400 font-medium">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Web App</Link>
            <Link href="/features" className="hover:text-emerald-400 transition-colors">Features</Link>
            <Link href="/download" className="hover:text-emerald-400 transition-colors">Download Android</Link>
            <a
              href="https://github.com/jojin1709/NestSave-Savings-Planner"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
