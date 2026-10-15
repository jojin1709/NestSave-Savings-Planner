import type { Metadata } from "next";
import Link from "next/link";
import NestSaveLogo from "../../components/NestSaveLogo";

export const metadata: Metadata = {
  title: "Terms of Service — NestSave",
  description: "Terms of Service & Usage Conditions for NestSave: Open-source MIT licensed savings planner and deterministic financial calculator engine.",
  openGraph: {
    title: "NestSave Terms of Service",
    description: "Open-source licensing terms, disclaimer, and user responsibilities.",
    url: "https://nestsave.vercel.app/terms",
    siteName: "NestSave",
  },
};

export default function TermsPage() {
  const lastUpdated = "October 15, 2026";

  return (
    <div className="min-h-screen bg-[#070d0a] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070d0a]/80 border-b border-emerald-950/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <NestSaveLogo size={32} />
            <span className="font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              NestSave
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-medium">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/features" className="text-zinc-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/download" className="text-zinc-400 hover:text-white transition-colors">
              Download APK
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
            MIT License & Open Source
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Last Updated: {lastUpdated} • Version 1.0.0
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-300 border-t border-zinc-800/60 pt-8">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using the NestSave web application (<code>nestsave.vercel.app</code>) or installing the NestSave Android APK, you agree to be bound by these Terms of Service. If you do not agree, do not use the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Open-Source License (MIT)</h2>
            <p className="mb-3">
              NestSave is free and open-source software licensed under the <strong>MIT License</strong>. 
              You are free to view, audit, fork, modify, and distribute the software subject to the standard conditions of the MIT License:
            </p>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 font-mono text-xs text-zinc-400">
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction...
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Not Financial Advice Disclaimer</h2>
            <p className="mb-3">
              <strong>NestSave is a personal calculation and planning utility, NOT a financial advisor, broker, or registered investment advisory service.</strong>
            </p>
            <p>
              The savings estimates, compound interest computations (Recurring Deposit / Fixed Deposit formulas), and shortfall recovery suggestions are mathematical projections provided solely for informational and personal budgeting purposes. 
              Actual yields from banks (SBI, HDFC, ICICI, etc.) depend on individual tax brackets (TDS), interest compounding intervals, and institution-specific rate updates. Always consult a certified financial advisor for formal investment decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. User Responsibility for Data Backups</h2>
            <p>
              Because NestSave is a 100% offline-first application that operates without a central cloud server, <strong>you are solely responsible for maintaining backups of your financial goals and transactions</strong>. 
              If you uninstall the app, clear app storage, or lose your device without an exported backup file, the data cannot be restored by the developer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, the software is provided &quot;as is&quot;, without warranty of any kind, express or implied. 
              In no event shall the author or copyright holders be liable for any claim, damages, or other liability arising from your use of the software.
            </p>
          </section>

          <section className="pt-4 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white mb-2">6. Contact Information</h2>
            <p className="text-xs text-zinc-400">
              For questions regarding these Terms, contact <strong>Jojin John</strong> via GitHub at <a href="https://github.com/jojin1709/NestSave-Savings-Planner" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">github.com/jojin1709/NestSave-Savings-Planner</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-950/40 bg-[#050907] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NestSave. Built with 100% privacy by Jojin John.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            <Link href="/features" className="hover:text-zinc-300 transition-colors">Features</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-emerald-400 font-semibold">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
