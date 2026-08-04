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
   native PowPeg quote otherwise. The Flyover option takes a BTC address typed directly by the
   user; the native PowPeg option instead needs the user to *derive* a destination address — see
   [Getting funds from a native peg-out](#getting-funds-from-a-native-peg-out-derived-address)
   below. A quote whose price has moved shows `QuoteDiffDialog.vue`.
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

## Getting funds from a native peg-out (derived address)

Unlike the Flyover path, a **native** (PowPeg) peg-out doesn't let the user type a destination
BTC address, and the RSK transaction it sends is a plain RBTC transfer to the Bridge contract
(`state.pegoutConfiguration.bridgeContractAddress`, `PEGOUT_TX_SEND` in
`src/pegout/store/pegoutTx/actions.ts`) with no address parameter at all. The Rootstock Bridge
decides the BTC payout address on its own, deterministically, from the RSK account that sent the
transaction — so the app has to independently compute that same address up front, just to show
the user where their BTC will land.

### How the app derives the address

1. In `PegoutOption.vue`, selecting the native/PowPeg option (not Flyover) shows a **"Derive"**
   chip instead of an address input, which emits `openAddressDialog` — handled by
   `PegoutForm.vue`, which opens `AddressDialog.vue`.
2. `AddressDialog.vue` asks the user to sign a fixed message ("Sign this message to get your
   Bitcoin destination address") with their connected wallet. Signing doesn't move funds or
   expose account data — it dispatches `web3Session/SESSION_SIGN_MESSAGE`
   (`src/common/store/session/actions.ts`).
3. That action `personal_sign`s the message, then recovers the signer's public key straight from
   the ECDSA signature — `getBtcAddressFromSignedMessage`
   (`src/common/utils/btcAddressUtils.ts`), via `getPubKeyFromRskSignedMessage2`, which uses
   ethers' `recoverPublicKey`/`computePublicKey` (the same secp256k1 key material the RSK account
   itself uses).
4. From that recovered public key, `getBtcAddressFromSignedMessage` derives a standard **P2PKH**
   Bitcoin address (`deriveAddress`, `src/common/utils/xPubUtils.ts`) and stores it as
   `session.btcDerivedAddress` (`SESSION_SET_BTC_ACCOUNT` mutation). `PegoutOption.vue` then shows
   this address read-only as the peg-out's destination.

### Why funds there need a separate recovery step

The derived address's private key is mathematically tied to the connected RSK/EVM wallet's own
key, but it isn't an address that wallet (MetaMask, a hardware wallet via RLogin, etc. — see
[Wallet connection & signing](./wallet-connection.md)) manages as one of its normal Bitcoin
receive addresses, since it comes from a non-standard, app-specific derivation rather than a
regular BIP32 path. Standard BTC wallet software won't show a balance or let the user spend from
it automatically. `PegoutOption.vue` surfaces this directly next to the derived address:

> Follow **these steps** to view and access your BTC funds.

"These steps" links to Rootstock's own official guide
(`constants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL` =
[dev.rootstock.io/guides/two-way-peg-app/pegout/deriving-electrum](https://dev.rootstock.io/guides/two-way-peg-app/pegout/deriving-electrum/)),
which walks through reconstructing the same private key in Electrum (from the same signing
account) so the BTC that landed at the derived address can actually be spent.
