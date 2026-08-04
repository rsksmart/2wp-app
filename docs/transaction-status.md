# Transaction status tracking

Both [Peg-in](./peg-in.md) and [Peg-out](./peg-out.md) end by pointing the user at status
tracking, and it's also directly reachable on its own.

## Routes

| Path | Component |
|---|---|
| `/status` | `src/status/views/Status.vue` (`StatusSearch` — no `txId` yet) |
| `/status/txId/:txId` | `src/status/views/Status.vue` (`Status` — pre-filled `txId`) |

`Status.vue` also doubles as the landing page on mobile devices: the `checkForMobileDevice`
router guard (`src/common/router/index.ts`) redirects any mobile visitor from Home straight to
`StatusSearch`, since the peg-in/peg-out flows themselves aren't supported on mobile.

## How it works

The user pastes a transaction ID (a BTC tx hash, an RSK tx hash, or a Flyover "bridge ID"); the
`status` Vuex module (`src/status/store/`) resolves what kind of transaction it is and fetches
its status:

1. **`STATUS_GET_TX_STATUS`** (`src/status/store/actions.ts`) — if the ID parses as a Flyover
   bridge ID (`isValidBridgeId`/`parseBridgeId`), it's routed to the Flyover-specific path;
   otherwise it calls `ApiService.getTxStatus(txId, txType)` against the `2wp-api` backend.
2. For Flyover transactions, **`STATUS_GET_FLYOVER_STATUS`** additionally queries the relevant
   Flyover service (`flyoverPegin` or `flyoverPegout`, see [Flyover quotes & refunds](./flyover.md))
   for the liquidity provider's own view of the quote's status.
3. **`STATUS_GET_ESTIMATED_RELEASE_TIME_IN_MINUTES`** estimates, for pegout transactions, how many
   blocks/minutes remain until the bridge releases the BTC, using `BridgeService`
   (`src/common/services/BridgeService.ts`) and the RSK node's current block height.

The result is rendered by `TxPegin.vue` or `TxPegout.vue`
(`src/common/components/status/`), with `StatusProgressBar.vue` shown for
invalid/unexpected-error/blockbook-error states, and `StatusSummary.vue` used elsewhere in the
app to show a compact status snippet.
