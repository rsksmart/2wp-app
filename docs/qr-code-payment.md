# QR code payment

Some payment paths in both [Peg-in](./peg-in.md) and [Peg-out](./peg-out.md) ask the user to send
funds from an external wallet/app rather than signing in-browser — a mobile BTC wallet scanning a
code to pay the peg-in address, or an RSK wallet paying a Flyover liquidity provider's address for
a peg-out. Both are handled by the same view.

## Route

| Path | Component |
|---|---|
| `/sendQr/:network` | `src/common/views/QrView.vue` |

The `network` param is one of the `QRCodeNetworks` constants (`bitcoin` or `rootstock`,
`src/common/store/constants.ts`). The router only allows entering this route when navigating from
a route that had a `network` param on the way in and a `wallet` param on the way out
(`src/common/router/index.ts`), i.e. mid-flow from peg-in/peg-out, not directly.

## How the QR is built

`QrView.vue` picks its data source based on `network`:

- **`bitcoin`** (peg-in) — reads the selected peg-in Flyover quote from the `flyoverPegin` store
  module (`FLYOVER_PEGIN_GET_SELECTED_QUOTE`): the quote's own `qrCode` image, amount
  (`valueToTransfer`), and destination (`recipientBtcAddress`).
- **`rootstock`** (peg-out) — reads the selected peg-out Flyover quote from `flyoverPegout`
  (`FLYOVER_PEGOUT_GET_SELECTED_QUOTE`): the liquidity provider's `lpsAddressQrCode`, the quote
  value, and the liquidity provider's RSK address.

See [Flyover quotes & refunds](./flyover.md) for how those quotes are obtained.

## Rendering

The actual QR image, amount, and address are displayed by `SendQr.vue`
(`src/common/components/exchange/SendQr.vue`), which also offers a shortcut to
[transaction status](./transaction-status.md) ("Search for Transaction ID status") once the user
has paid.
