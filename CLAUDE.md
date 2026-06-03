# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PowPeg app is a Vue 3 + TypeScript SPA for the 2-Way-Peg (PowPeg) solution — a web interface for bridging Bitcoin ↔ RSK networks. It integrates with a backend REST API (`2wp-api`) and supports hardware wallets (Ledger, Trezor) and software wallets (Leather, Xverse, Enkrypt, ReownAppKit).

## Commands

```bash
nvm use                  # Switch to Node v20.18.2 (from .nvmrc)
npm ci                   # Install dependencies
npm run serve            # Dev server at https://localhost:8080
npm run build            # Production build
npm run lint             # ESLint
npm run test             # Unit tests with coverage
npm run test:unit        # Unit tests (same as test)
npm run test:unit-logs   # Unit tests with logging enabled
```

**Run a single test file:**
```bash
npm run test -- --testPathPattern=SatoshiBig
```

## Environment Variables

Create `.env.local` in the root. See `ENV_VARIABLES.md` for the full table. Critical variables:

| Variable | Purpose |
|---|---|
| `VUE_APP_COIN` | Bitcoin network: `test` or `main` |
| `VUE_APP_API_BASE_URL` | Backend 2wp-api URL |
| `VUE_APP_RSK_NODE_HOST` | RSK node URL |
| `VUE_APP_REOWN_PROJECT_ID` | ReownAppKit project ID |
| `VUE_APP_FLYOVER_NETWORK` | Flyover network: `Mainnet`, `Testnet`, `Regtest`, etc. |

Reference `.env.local.test` for a working example.

## Architecture

### Feature Modules

The `src/` directory is split into feature modules that mirror the PowPeg flows:

- **`src/pegin/`** — Bitcoin → RSK flow. Contains its own `components/`, `services/` (TxBuilder, BalanceService, TxFeeService), `store/`, `types/`, and `views/`.
- **`src/pegout/`** — RSK → Bitcoin flow. Same structure.
- **`src/status/`** — Transaction status tracking page.
- **`src/common/`** — Shared code used by all modules: ABIs, components, composables, providers, router, services, store, types, utils, plugins.

### State Management

Vuex 4 with namespaced modules. Each feature module has its own store slice (`pegin/store/`, `pegout/store/`, `status/store/`) plus shared modules in `common/store/`. Store constants (action/mutation names) are defined in `common/store/constants.ts`.

### Wallet Providers

Each wallet (Ledger, Trezor, Leather, Xverse, Enkrypt, ReownAppKit) is implemented as a provider class under `src/common/providers/`. Providers are mocked in tests — see `tests/utils/` for mock implementations. To add a new wallet, follow `WALLET.md`.

### Custom Numeric Types

`SatoshiBig` and `WeiBig` (in `src/common/`) extend `Big.js` for precision arithmetic on BTC and RBTC amounts. Use these instead of raw numbers or strings for all amount calculations to avoid floating point errors.

### Services Layer

Business logic lives in `*Service` classes under `src/common/services/` and `src/pegin/services/`. These wrap API calls, blockchain interactions, and wallet operations. Services throw `ServiceError` (custom class with `code` + `message`) for structured error handling.

### Smart Contract ABIs

RSK Bridge and Flyover contract ABIs are in `src/common/abis/`. Ethers.js 5.x is used for all EVM interactions.

## Key Constraints

- **ESLint rule `no-explicit-any` is enforced** — avoid `any` types.
- **Line length max is 100 characters** (Airbnb ESLint config).
- **Avoid nested ternary operators** — this is a stated review standard.
- **Tests ignore `*Builder.spec.ts` files** due to an AppKit/Vue import issue — do not create test files matching that pattern unless the issue is resolved.
- **Coverage thresholds:** 20% minimum on branches, lines, functions, and statements (only for `src/(common|pegin)/(providers|services|utils)/*.ts`).
- The dev server requires HTTPS — self-signed certs are configured in `vue.config.js`. Browser security warnings on localhost are expected.
- `appkit-*` elements are registered as custom elements (not Vue components) in `vue.config.js` to avoid Vue warnings.

## Code Review Standards

When reviewing code, apply the checks in `.github/prompts/review-code.prompt.md`:
1. Security — input validation, OWASP Top 10
2. Performance — algorithm complexity, unnecessary computations
3. Code Quality — readability, naming, function size, duplication
4. Architecture — separation of concerns, error handling
5. Testing — coverage quality, documentation

Format findings as: **Critical Issues** (must fix), **Suggestions** (consider), **Good Practices** (acknowledge).
