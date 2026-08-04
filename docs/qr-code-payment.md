# QR code payment

`QrView.vue` is built to handle a payment path for either flow — a mobile BTC wallet scanning a
code to pay the peg-in address, or an RSK wallet paying a Flyover liquidity provider's address for
a peg-out — from a single shared view. Only the [Peg-in](./peg-in.md) path is actually reachable
today; see the route guard note below.

## Route

| Path | Component |
|---|---|
| `/sendQr/:network` | `src/common/views/QrView.vue` |

The `network` param is one of the `QRCodeNetworks` constants — `bitcoin` or `ethereum` (the
peg-out/RSK value; despite the constant's name, `QRCodeNetworks.ROOTSTOCK === 'ethereum'`,
`src/common/store/constants.ts`).

### Route guard: only reachable from peg-in today

```ts
beforeEnter: (from: RouteLocationNormalized, to: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (from.params.network && to.params.wallet) { next(); } else { next({ name: 'Home' }); }
},
```

The parameter *names* here are misleading: Vue Router always calls a `beforeEnter` guard as
`(to, from, next)`, but this guard's declared parameters are named `(from, to, next)`. So
`from.params.network` actually reads the **destination** route's `network` param (always present,
since both callers set it), and `to.params.wallet` actually reads the **previous** route's
`wallet` param. In practice the guard only lets someone through when they navigated here *from* a
route with a `:wallet` param — which today is only `/pegin/:wallet/create`
(`src/pegin/components/create/PegInForm.vue` pushes `QrView` with `network: 'bitcoin'` from
there).

`PegoutForm.vue`'s `acceptAndSendQr` does push `router.push({ name: 'QrView', params: { network:
constants.QRCodeNetworks.ROOTSTOCK } })`, but since the previous route is `/pegout` (no `:wallet`
param), this guard currently redirects that navigation to Home instead of showing the QR — a
pre-existing mismatch between `PegoutForm.vue` and the router guard, not something this doc can
paper over. Fixing it is a code change outside this documentation update's scope.

## How the QR is built

`QrView.vue` picks its data source based on `network`:

- **`bitcoin`** (peg-in) — reads the selected peg-in Flyover quote from the `flyoverPegin` store
  module (`FLYOVER_PEGIN_GET_SELECTED_QUOTE`): the quote's own `qrCode` image, amount
  (`valueToTransfer`), and destination (`recipientBtcAddress`).
- **`ethereum`** (peg-out's `QRCodeNetworks.ROOTSTOCK`) — reads the selected peg-out Flyover quote
  from `flyoverPegout` (`FLYOVER_PEGOUT_GET_SELECTED_QUOTE`): the liquidity provider's
  `lpsAddressQrCode`, the quote value, and the liquidity provider's RSK address. This branch is
  implemented but not currently reachable through the UI — see the route guard note above.

See [Flyover quotes & refunds](./flyover.md) for how those quotes are obtained.

## Rendering

The actual QR image, amount, and address are displayed by `SendQr.vue`
(`src/common/components/exchange/SendQr.vue`), which also offers a shortcut to
[transaction status](./transaction-status.md) ("Search for Transaction ID status") once the user
has paid.
