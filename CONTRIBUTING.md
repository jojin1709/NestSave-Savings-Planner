# Contributing to NestSave

Thank you for your interest in contributing to **NestSave**!

NestSave is an offline-first savings goal planner built for personal privacy and mathematical rigor.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## How Can I Contribute?

### 1. Reporting Bugs
- Search existing issues before creating a new one.
- Provide a clear title, steps to reproduce, expected vs. actual behavior, and device/browser details.

### 2. Suggesting Enhancements
- Feature requests and ideas are welcome! Please open an issue outlining the motivation and workflow.

### 3. Submitting Pull Requests
1. Fork the repository and create your feature branch from `master`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Ensure all code adheres to our zero-cloud, privacy-first architecture:
   - **No external telemetry, analytics, or trackers.**
   - **Deterministic mathematical logic only** (no floating-point hallucinations).
3. Test your changes:
   ```bash
   # Web verification
   npm run build

   # Android verification
   cd android && ./gradlew assembleRelease
   ```
4. Commit your changes with clear semantic messages (`feat: ...`, `fix: ...`, `docs: ...`).
5. Open a Pull Request against `master`.

---

## License

By contributing to NestSave, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
