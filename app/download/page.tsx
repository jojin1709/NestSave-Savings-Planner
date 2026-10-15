import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download NestSave Android App — APK (Offline-First Financial Planner)",
  description: "Download the native NestSave Android app. 100% offline-first, biometric security, SIP/EMI/RD/FD calculators, Room database, and zero tracking.",
  openGraph: {
    title: "Download NestSave for Android",
    description: "Pure native Kotlin + Jetpack Compose offline financial savings planner.",
    url: "https://nestsave.vercel.app/download",
    siteName: "NestSave",
  },
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              NestSave
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Android
              </span>
            </span>
            <p className="text-xs text-slate-400 hidden sm:block">Private, Offline Savings Goal Planner</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            ← Back to Web App
          </Link>
          <a
            href="https://github.com/jojin1709/NestSave-Savings-Planner-v1"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Official Release v1.0.0 is Live</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          Your Wealth Roadmap, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            100% Native &amp; Offline.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          Built natively in Kotlin and Jetpack Compose. Your financial goals, deposits, and calculations live securely on your device with hardware biometric lock and zero cloud tracking.
        </p>

        {/* Primary Download Box */}
        <div className="mt-10 w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs sm:text-sm text-slate-400 mb-4 pb-3 border-b border-slate-800">
            <span>File: <strong className="text-slate-200">NestSave-v1.0.0.apk</strong></span>
            <span>Size: <strong className="text-slate-200">~18 MB</strong></span>
            <span>Target: <strong className="text-slate-200">Android 8.0+</strong></span>
          </div>

          <a
            href="/downloads/NestSave.apk"
            download="NestSave-v1.0.0.apk"
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 16l4-5h-3V4h-2v7H8l4 5zm9 4H3v-2h18v2z" />
            </svg>
            Download Direct APK (.apk)
          </a>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              No Ads / No Trackers
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Biometric Protected
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
              Zero Internet Permission
            </span>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="mt-20 w-full text-left">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Native Android Capabilities</h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400">Engineered with modern Kotlin, Jetpack Compose, and SQLite Room.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 text-2xl">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">100% Offline-First</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Uses Android Room SQLite database stored purely in private application sandboxes. No cloud synchronization, no accounts required, no telemetry.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4 text-2xl">
                🔐
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Biometric Fingerprint Lock</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Integrated with Android&apos;s native BiometricPrompt API. Protect your savings goals and private asset values with fingerprint or face recognition.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 text-2xl">
                📊
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Full Financial Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Includes Indian banking calculators: RD (quarterly compounding), FD, SIP with annual step-up incrementation, and EMI amortizations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 text-2xl">
                🔄
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1-Click Recalibrate Plan</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                If a goal falls behind pace, instantly choose between recalculating higher monthly savings or extending the target date to remain on track.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 text-2xl">
                📈
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Inflation Adjustment</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Calculates the real future purchasing power for long-term targets (e.g. 5–10 years for education or home down payments) at user-configured inflation rates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 text-2xl">
                🎨
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Material 3 Dynamic Theme</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Native Jetpack Compose Material 3 dark and light modes with edge-to-edge system bar integration and smooth fluid animations.
              </p>
            </div>
          </div>
        </section>

        {/* 3-Step Installation Guide */}
        <section className="mt-20 w-full max-w-3xl text-left bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📥</span> Quick Installation Guide (3 Simple Steps)
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-white">Download the APK</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Tap the direct download button above. Your browser (Chrome / Brave / Firefox) will save <code className="text-emerald-400 bg-slate-800/80 px-1.5 py-0.5 rounded text-xs">NestSave-v1.0.0.apk</code>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-white">Allow Installation from Browser</h4>
                <p className="text-sm text-slate-400 mt-1">
                  When you tap the downloaded file, Android may ask: <em>&ldquo;For your security, your phone is not allowed to install unknown apps from this source.&rdquo;</em> Tap <strong>Settings</strong> and toggle on <strong>Allow from this source</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-white">Tap Install &amp; Enjoy!</h4>
                <p className="text-sm text-slate-400 mt-1">
                  Tap <strong>Install</strong>. Once finished, tap <strong>Open</strong> to start organizing your private financial goals offline!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="mt-16 w-full max-w-3xl text-left">
          <h3 className="text-lg font-bold text-white mb-4">Package Specifications</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm text-left text-slate-300">
              <tbody className="divide-y divide-slate-800 bg-slate-900/30">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-400">Package Name</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">com.nestsave</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-400">Version</td>
                  <td className="px-4 py-3">1.0.0 (Version Code 1)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-400">Minimum Requirement</td>
                  <td className="px-4 py-3">Android 8.0 (API level 26) or higher</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-400">Target Platform</td>
                  <td className="px-4 py-3">Android 14 / Android 15 (API level 34+)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-400">Required Permissions</td>
                  <td className="px-4 py-3 text-slate-300">
                    <span className="inline-block bg-slate-800 px-2 py-0.5 rounded text-xs mr-2">USE_BIOMETRIC</span>
                    <span className="inline-block bg-slate-800 px-2 py-0.5 rounded text-xs">VIBRATE</span>
                    <span className="text-xs text-emerald-400 block mt-1">✓ No internet permission declared — pure offline guarantee</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 NestSave. Open-source local-first financial planning software.</p>
        <p className="mt-1">
          <Link href="/" className="hover:text-slate-300 transition-colors">Web App</Link> •{" "}
          <a href="https://github.com/jojin1709/NestSave-Savings-Planner-v1" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">GitHub Repository</a> •{" "}
          <a href="https://github.com/jojin1709/NestSave-Savings-Planner-v1/releases" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">Releases</a>
        </p>
      </footer>
    </div>
  );
}
