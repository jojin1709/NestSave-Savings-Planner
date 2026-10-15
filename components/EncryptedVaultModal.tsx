"use client";

import { useState } from "react";
import { X, Lock, Download, Upload, ShieldCheck, KeyRound, AlertCircle } from "lucide-react";
import { encryptVault, decryptVault } from "../lib/security";

interface EncryptedVaultModalProps {
  mode: "export" | "import";
  rawBackupJson?: string;
  onImportDecrypted?: (json: string) => Promise<void>;
  onClose: () => void;
}

export default function EncryptedVaultModal({
  mode,
  rawBackupJson,
  onImportDecrypted,
  onClose
}: EncryptedVaultModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (!password) {
      setError("Please choose a password to encrypt your vault.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const encrypted = await encryptVault(rawBackupJson || "{}", password);
      const blob = new Blob([encrypted], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nestsave-vault-encrypted-${new Date().toISOString().slice(0, 10)}.enc.json`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Encryption failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!file) {
      setError("Please select your .enc.json backup file.");
      return;
    }
    if (!password) {
      setError("Please enter the decryption password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const text = await file.text();
      const decrypted = await decryptVault(text, password);
      if (onImportDecrypted) {
        await onImportDecrypted(decrypted);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Decryption failed. Ensure the password is correct.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="finance-card w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-[#0d684c] dark:text-emerald-400" />
            <h2 className="text-base font-bold tracking-tight">
              {mode === "export" ? "Export Encrypted Vault" : "Restore Encrypted Vault"}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          {mode === "export"
            ? "Your vault data will be encrypted locally using military-grade AES-GCM 256. Only someone with your chosen password can unlock it."
            : "Select your encrypted NestSave backup file and provide your decryption password to restore your vault."}
        </p>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          {mode === "import" && (
            <div>
              <label className="label">Encrypted Backup File (.enc.json)</label>
              <input
                type="file"
                accept=".json,.enc.json"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="input cursor-pointer"
              />
            </div>
          )}

          <div>
            <label className="label">Encryption Password</label>
            <input
              type="password"
              placeholder="Enter strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input font-semibold"
            />
          </div>

          {mode === "export" && (
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input font-semibold"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
          <ShieldCheck size={14} className="text-[#0d684c]" />
          <span>PBKDF2 key derivation • 100,000 rounds • Zero cloud</span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="btn-secondary !py-2 text-xs">
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={mode === "export" ? handleExport : handleImport}
            className="btn-primary !py-2 text-xs font-bold flex items-center gap-1.5"
          >
            {mode === "export" ? (
              <>
                <Download size={14} /> Download Encrypted File
              </>
            ) : (
              <>
                <Upload size={14} /> Decrypt & Restore Vault
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
