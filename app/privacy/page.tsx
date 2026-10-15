import type { Metadata } from "next";
import Link from "next/link";
import NestSaveLogo from "../../components/NestSaveLogo";

export const metadata: Metadata = {
  title: "Privacy Policy — NestSave",
  description: "NestSave Privacy Policy: 100% offline-first architecture, zero tracking, zero personal data collection, and local encrypted vault storage.",
  openGraph: {
    title: "NestSave Privacy Policy — Zero Cloud, 100% Private",
    description: "NestSave does not collect, transmit, store, or sell your personal or financial data.",
    url: "https://nestsave.vercel.app/privacy",
    siteName: "NestSave",
  },
};

export default function PrivacyPage() {
  const lastUpdated = "October 15, 2026";

  return (
    <div className="min-h-screen bg-[#070d0a] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070d0a]/80 border-b border-emerald-950/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <NestSaveLogo size={32} />
            <span className="font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              NestSave
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/features"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/download"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Download APK
            </Link>
            <Link
              href="/terms"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Title & Badge */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Offline-First Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Effective Date: {lastUpdated} • Version 1.0.0
          </p>
        </div>

        {/* Quick Highlights Card */}
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 mb-12">
          <h2 className="text-base font-bold text-emerald-300 flex items-center gap-2 mb-3">
            <span>🛡️</span> Summary: What You Need To Know
          </h2>
          <ul className="space-y-2 text-sm text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Zero Data Collection:</strong> We do not collect, log, track, or share your names, financial balances, savings targets, or device identifiers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>100% Local Storage:</strong> All data stays securely on your phone/browser using local SQLite Room or LocalStorage.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>No Ads or Third-Party Analytics:</strong> There are no Google Analytics, Firebase tracking, Facebook SDKs, or advertising networks inside NestSave.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Hardware Biometric Security:</strong> Biometrics (fingerprint/Face ID) are verified exclusively by your device operating system hardware. Raw biometric data is never accessible to the app.</span>
            </li>
          </ul>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-zinc-300 border-t border-zinc-800/60 pt-8">
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">1.</span> Information Collection and Use
            </h2>
            <p className="mb-3">
              NestSave is built upon a fundamental architectural commitment: <strong>privacy by design</strong>. 
              The application does not require you to create an account, register an email address, or provide any personal identification.
            </p>
            <p>
              When you enter financial targets, recurring deposit allocations, salaries, or milestone notes, this information is stored 
              <strong> solely and exclusively on your local device storage</strong> (Android Room SQLite database or browser LocalStorage). 
              At no point is this data transmitted over the internet to any external servers or cloud providers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">2.</span> Device Permissions
            </h2>
            <p className="mb-3">
              NestSave requests only the minimum operating system permissions strictly required for basic app execution:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">USE_BIOMETRIC / USE_FINGERPRINT:</strong> Used solely to prompt your device hardware security chip for biometric authentication to unlock your savings dashboard. Biometric templates never leave your device secure enclave.
              </li>
              <li>
                <strong className="text-zinc-200">INTERNET (Optional / Android):</strong> Used only to check for optional app software updates from the official GitHub / Vercel endpoint (<code>/api/version</code>). No analytics or user telemetry is transmitted during update checks.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">3.</span> Data Encryption & Vault Backups
            </h2>
            <p className="mb-3">
              NestSave provides client-side encrypted backup export and import functionality. 
              When you export an encrypted vault backup, the file is protected with <strong>AES-GCM 256-bit encryption</strong> using a key derived from your passphrase via PBKDF2 with 100,000 iterations.
            </p>
            <p>
              Because your passphrase is never sent to any server, <strong>if you lose your backup password, it cannot be recovered</strong> by anyone, including the developer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">4.</span> Third-Party Services & Links
            </h2>
            <p className="mb-3">
              NestSave contains no advertising SDKs, no affiliate tracking, and no behavioral profiling tools. 
              The website may contain links to open-source repository platforms (e.g., GitHub, Trendshift, LinkedIn) or official app distribution stores. 
              Interacting with third-party sites is governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">5.</span> Children's Privacy
            </h2>
            <p>
              NestSave does not knowingly collect or solicit any personal information from children under the age of 13. Since no personal data is collected from any user regardless of age, the application is rated suitable for all ages (Everyone / PEGI 3).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">6.</span> Changes to This Privacy Policy
            </h2>
            <p>
              Any future revisions to this Privacy Policy will be reflected on this page and published with an updated version tag in the project repository. Because NestSave does not collect emails, users are encouraged to review this page periodically.
            </p>
          </section>

          <section className="pt-4 border-t border-zinc-800/60">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-emerald-400">7.</span> Developer Contact & Open Source Audits
            </h2>
            <p className="mb-3">
              NestSave is an open-source project. Anyone can inspect, verify, and compile the entire source code to audit our privacy guarantees:
            </p>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1.5 text-zinc-300">
              <p><strong>Developer:</strong> Jojin John</p>
              <p><strong>Source Code:</strong> <a href="https://github.com/jojin1709/NestSave-Savings-Planner" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">github.com/jojin1709/NestSave-Savings-Planner</a></p>
              <p><strong>Issues & Inquiries:</strong> <a href="https://github.com/jojin1709/NestSave-Savings-Planner/issues" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">github.com/jojin1709/NestSave-Savings-Planner/issues</a></p>
              <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/jojin-john/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">linkedin.com/in/jojin-john/</a></p>
            </div>
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
            <Link href="/privacy" className="text-emerald-400 font-semibold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
