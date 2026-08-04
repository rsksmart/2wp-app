# Peg-in (BTC → RBTC)

The peg-in flow lets a user move BTC into Rootstock as RBTC. It's reached from the Home
screen ("BTC TO RBTC") and lives under `src/pegin/`.

## Route

| Path | Component | Guards |
|---|---|---|
| `/pegin/:wallet/create` | `src/pegin/views/Create.vue` | `checkAcceptedTerms`, `checkForMobileDevice` (`src/common/router/index.ts`) |

The `:wallet` route param selects which wallet provider the user picked on the Home screen
(Ledger, Trezor, Leather, Xverse, Enkrypt, or a Reown-connected wallet).

## Steps

1. **Connect the BTC wallet** — `Create.vue` renders `SendBitcoin.vue`
   (`src/pegin/components/create/SendBitcoin.vue`), which shows `ConnectDevice.vue` until the
   wallet reports it's ready. See [Wallet connection & signing](./wallet-connection.md) for how
   each wallet type connects and later signs the transaction.
2. **Enter the amount and destination** — `PegInForm.vue`
   (`src/pegin/components/create/PegInForm.vue`) collects the BTC amount, the RSK destination
   address (`RskDestinationAddress.vue`/`RskAddressInput.vue`), and the fee level
   (`BtcFeeSelect.vue`). It also offers a Flyover ("fast mode") quote alongside the native PowPeg
   path — see [Flyover quotes & refunds](./flyover.md).
3. **Pick the source account / UTXOs** — `PegInAccountSelect.vue`
   (`src/pegin/components/create/PegInAccountSelect.vue`) shows the connected wallet's balance
   per address type and lets the user open the UTXO picker — see
   [UTXO selection](./utxo-selection.md).
4. **Confirm and send** — `ConfirmTx.vue` (`src/pegin/components/create/ConfirmTx.vue`) builds the
   unsigned BTC transaction via the wallet-specific `TxBuilder`
   (`src/pegin/middleware/TxBuilder/*`, see [Wallet connection & signing](./wallet-connection.md)),
   has the wallet sign it, and broadcasts it through `PeginTxService`
   (`src/pegin/services/PeginTxService.ts`).
5. **Pay via QR (optional path)** — if the connected wallet can't sign/broadcast directly on this
   device (e.g. scanning from a mobile wallet), the flow redirects to `/sendQr/bitcoin`
   (`QrView.vue`) instead of step 4 — see [QR code payment](./qr-code-payment.md).
6. On success the router sends the user to `SuccessTx.vue`
   (`type` = `pegin`, via `/:type/success/tx/:txId/:amount/:confirmations`), from where they can
   look up the transaction on the [transaction status](./transaction-status.md) page.

## State

Vuex module `pegInTx` (`src/pegin/store/PeginTx/`) holds the in-progress transaction (amount,
addresses, selected UTXOs, fee). The `flyoverPegin` module
(`src/pegin/store/FlyoverPegin/`) holds the Flyover quote when fast mode is selected. Both are
cleared via `PEGIN_TX_CLEAR_STATE` when the user backs out to Home.

## Fees

`TxFeeService` (`src/pegin/services/TxFeeService.ts`) estimates the BTC network fee for the
selected fee level; `BalanceService` (`src/pegin/services/BalanceService.ts`) computes the
spendable balance per address type from the wallet's UTXOs (see
[UTXO selection](./utxo-selection.md) for how those UTXOs are chosen).
