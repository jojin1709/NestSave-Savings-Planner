import React from "react";

export default function NestSaveLogo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NestSave Logo"
    >
      <rect width="128" height="128" rx="36" fill="#0d684c" />
      <circle cx="64" cy="64" r="34" stroke="#ffffff" strokeWidth="7" fill="none" />
      <circle cx="64" cy="64" r="21" stroke="#ffffff" strokeWidth="6.5" fill="none" />
      <circle cx="64" cy="64" r="9" stroke="#ffffff" strokeWidth="6" fill="none" />
    </svg>
  );
}
