# Peg-out (RBTC → BTC)

The peg-out flow lets a user move RBTC out of Rootstock back to a BTC address. It's reached from
the Home screen ("RBTC TO BTC") and lives under `src/pegout/`.

## Route

| Path | Component | Guards |
|---|---|---|
| `/pegout` | `src/pegout/views/PegOut.vue` | `checkAcceptedTerms`, `checkRSKConnection`, `checkForMobileDevice` (`src/common/router/index.ts`) |

Unlike peg-in, the wallet isn't chosen via the route — `checkRSKConnection` requires an already
Reown-connected EVM/RSK account (`web3Session/SESSION_IS_ACCOUNT_CONNECTED`) before entering. See
[Wallet connection & signing](./wallet-connection.md).

## Steps

1. **Initialize the page** — `PegOut.vue` dispatches `pegOutTx/PEGOUT_TX_INIT` and, if the
   `FLYOVER_PEG_OUT` feature flag is enabled for the connected account
   (`web3Session/SESSION_GET_FEATURE`), initializes the Flyover pegout module
   (`flyoverPegout/FLYOVER_PEGOUT_INIT`) — see [Flyover quotes & refunds](./flyover.md).
2. **Enter the amount** — `PegoutForm.vue` (`src/pegout/components/PegoutForm.vue`) renders
   `RbtcInputAmount.vue` to collect the RBTC amount to convert.
3. **Choose a quote** — once an amount is entered, the form shows the available options via
   `PegoutOption.vue`: a Flyover ("Fast Mode") quote when liquidity/eligibility allow it, and the
   native PowPeg quote otherwise. Selecting a Flyover option that requires a specific payout
   address opens `AddressDialog.vue`; a quote whose price has moved shows `QuoteDiffDialog.vue`.
4. **Send** — submitting builds and sends the RBTC transaction through the connected wallet's
   provider (`ethers.providers.Web3Provider` from `web3Session`), dispatching into the
   `pegoutTx` store module (`src/pegout/store/pegoutTx/`).
5. **Pay via QR (Flyover path)** — when the selected option is a Flyover quote that expects the
   RSK-side payment to a liquidity provider address, the flow can route to `/sendQr/rootstock`
   (`QrView.vue`) — see [QR code payment](./qr-code-payment.md).
6. On success the router sends the user to `SuccessTx.vue`
   (`type` = `pegout`), from where they can look up the transaction on the
   [transaction status](./transaction-status.md) page.

## State

Vuex module `pegoutTx` (`src/pegout/store/pegoutTx/`) holds the in-progress transaction; the
`flyoverPegout` module (`src/pegout/store/FlyoverPegout/`) holds Flyover quotes and liquidity
provider data when fast mode is used.

## Loading dialog

`LoadingDialog.vue` (`src/pegout/components/LoadingDialog.vue`) is shown while a quote is being
fetched/submitted.
