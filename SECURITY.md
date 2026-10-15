# Security Policy

## Security & Privacy Commitment

NestSave is an **offline-first, zero-cloud personal financial roadmap**. We treat user privacy and mathematical integrity as paramount priorities.

- **Zero Cloud Architecture:** NestSave does not maintain cloud databases, user logins, or remote server persistence. All personal data lives inside your device's sandbox (IndexedDB on Web, SQLite Room on Android).
- **Client-Side Cryptography:** Vault exports use AES-GCM 256-bit encryption with key derivation via PBKDF2 (100,000 SHA-256 iterations).

---

## Supported Versions

Security updates are applied to the active branch (`master`) and released as part of the latest Web and Android builds.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability, weakness, or flaw in NestSave (including cryptographic implementation bugs, input sanitization flaws, or Android permission leaks), please follow responsible disclosure:

1. **Do not create a public GitHub issue.**
2. Send a report via [GitHub Security Advisories](https://github.com/jojin1709/NestSave-Savings-Planner/security/advisories/new) or contact the project maintainer directly.
3. Include:
   - A description of the vulnerability and attack vector.
   - Steps to reproduce or proof-of-concept.
   - The platform affected (Web, PWA, or Android Native).

We will acknowledge receipt within 48 hours and work with you to patch the issue before public disclosure.
