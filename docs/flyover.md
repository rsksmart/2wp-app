# Flyover quotes & refunds

"Flyover" ("Fast Mode" in the UI) is an optional, faster path offered alongside the native PowPeg
transaction in both [Peg-in](./peg-in.md) and [Peg-out](./peg-out.md): a liquidity provider
fronts the funds on the destination chain against a quote, instead of the user waiting for
PowPeg's own confirmation/release cycle.

## Service

`FlyoverService` (`src/common/services/FlyoverService.ts`) wraps the `@rsksmart/flyover-sdk`'s
`Flyover` client. `initialize()` opens a `BlockchainConnection` either from the connected wallet's
EVM provider or, when none is connected yet, from a throwaway random-mnemonic wallet — just
enough to read quotes anonymously before the user has connected.

## Per-flow store modules

Peg-in and peg-out each keep their own Flyover state, since the quote shape and lifecycle differ:

| Module | Location | Used for |
|---|---|---|
| `flyoverPegin` | `src/pegin/store/FlyoverPegin/` | Requesting/accepting a peg-in quote (`FlyoverPegin.ts` type), read by `PegInForm.vue`/`ConfirmTx.vue` |
| `flyoverPegout` | `src/pegout/store/FlyoverPegout/` | Requesting/accepting a peg-out quote (`FlyoverPegout.ts` type), read by `PegoutForm.vue` |

Both are initialized on demand (`FLYOVER_PEGIN_INIT` / `FLYOVER_PEGOUT_INIT`) rather than
eagerly — peg-out only initializes Flyover when the `FLYOVER_PEG_OUT` feature flag is enabled for
the connected account (see `PegOut.vue`).

## Where a quote is consumed

- A selected quote can require paying a specific address — surfaced via
  [QR code payment](./qr-code-payment.md) (`QrView.vue` reads `flyoverPegin`'s or
  `flyoverPegout`'s selected-quote getter depending on the `network` route param).
- Once a Flyover transaction is submitted, [transaction status](./transaction-status.md) polls
  the same `flyoverPegin`/`flyoverPegout` service (`getPeginStatus`/`getPegoutStatus`) for the
  liquidity provider's status on top of the on-chain status.

## Refunds

If a Flyover quote isn't fulfilled by the liquidity provider in time, refund handling is exposed
through the same `flyoverPegin`/`flyoverPegout` modules and the underlying SDK's refund
endpoints — surfaced to the user via the error dialogs in `PegoutOption.vue`/`PegInForm.vue`
(e.g. insufficient liquidity, quote no longer available).
