"use client";

import { useState } from "react";
import { Lock, Delete, ShieldCheck } from "lucide-react";
import NestSaveLogo from "./NestSaveLogo";
import { verifyPin } from "../lib/security";

interface AppLockModalProps {
  pinHash: string;
  pinSalt: string;
  onUnlock: () => void;
}

export default function AppLockModal({ pinHash, pinSalt, onUnlock }: AppLockModalProps) {
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handlePress(digit: string) {
    if (verifying || enteredPin.length >= 4) return;
    setError(false);
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);

    if (nextPin.length === 4) {
      setVerifying(true);
      const isMatch = await verifyPin(nextPin, pinHash, pinSalt);
      if (isMatch) {
        onUnlock();
      } else {
        setError(true);
        setVerifying(false);
        setTimeout(() => {
          setEnteredPin("");
        }, 500);
      }
    }
  }

  function handleBackspace() {
    if (verifying) return;
    setError(false);
    setEnteredPin(prev => prev.slice(0, -1));
  }

  function handleClear() {
    if (verifying) return;
    setError(false);
    setEnteredPin("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000] text-zinc-100 select-none">
      <div className="w-full max-w-xs flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center gap-2">
          <NestSaveLogo size={52} />
          <h2 className="text-xl font-bold tracking-tight text-white">NestSave Vault Locked</h2>
          <p className="text-xs text-zinc-400">Enter your 4-digit security PIN</p>
        </div>

        {/* Pin Dots */}
        <div className={`flex items-center gap-4 py-2 ${error ? "animate-bounce" : ""}`}>
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                idx < enteredPin.length
                  ? "bg-[#0d684c] border-[#0d684c] scale-110 shadow-sm shadow-emerald-500/50"
                  : "border-zinc-700 bg-zinc-900"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-500 animate-in fade-in">
            Incorrect PIN. Try again.
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handlePress(d)}
              disabled={verifying}
              className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-lg font-bold text-white transition flex items-center justify-center border border-zinc-800"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            disabled={verifying || enteredPin.length === 0}
            className="h-14 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 text-xs font-bold text-zinc-400 transition flex items-center justify-center border border-zinc-800/60"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handlePress("0")}
            disabled={verifying}
            className="h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-lg font-bold text-white transition flex items-center justify-center border border-zinc-800"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={verifying || enteredPin.length === 0}
            className="h-14 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 transition flex items-center justify-center border border-zinc-800/60"
            title="Delete"
          >
            <Delete size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-2">
          <ShieldCheck size={14} className="text-[#0d684c]" />
          <span>Local on-device SHA-256 verification</span>
        </div>
      </div>
    </div>
  );
}
