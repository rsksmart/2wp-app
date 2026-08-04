# Wallet connection & signing

Both [Peg-in](./peg-in.md) and [Peg-out](./peg-out.md) need a connected wallet — a BTC wallet to
sign the peg-in transaction, an RSK/EVM wallet to hold the RBTC session used by both flows. This
page covers the shared connection/signing mechanism; for step-by-step instructions on adding a
new wallet button, see [`Wallet.md`](../Wallet.md) at the repo root.

## RSK / EVM session (used by both flows)

`Home.vue` asks the user to pick **Software Wallet** or **Hardware Wallet** (`Web3WalletDialog.vue`
for peg-out, `BtcWalletDialog.vue` for peg-in) and connects via one of two paths depending on the
answer:

- **Software** → `useWallet()` (`src/common/composables/useWallet.ts`) wraps Reown AppKit's Vue
  hooks (`useAppKit`, `useAppKitAccount`, `useAppKitProvider`, `useDisconnect`) to open the AppKit
  connect modal, wrap the resulting EIP-1193 provider in an `ethers.providers.Web3Provider`, and
  dispatch `web3Session/SESSION_CONNECT_REOWN_WEB3` (`src/common/store/session/`) with the
  provider and the detected wallet name (read via EIP-6963 provider discovery, since AppKit itself
  doesn't expose it).
- **Hardware** (Ledger/Trezor connecting directly to RSK, not through AppKit) → `connectWeb3()`
  dispatches `web3Session/SESSION_CONNECT_WEB3` (`src/common/store/session/actions.ts`), which
  gets an `RLogin` instance (`getRloginInstance`, `src/common/utils/rlogin.ts`, configured with
  `@rsksmart/rlogin-ledger-provider` and `@rsksmart/rlogin-trezor-provider`) and connects through
  it instead.

Either path ends by populating `web3Session`'s `ethersProvider`/`account` state. The
`SESSION_IS_ACCOUNT_CONNECTED` getter is what the peg-out route guard (`checkRSKConnection`)
checks before allowing entry.

## BTC wallets (peg-in signing)

Each BTC wallet integration under `src/common/services/` (`LedgerService`, `TrezorService`,
`LeatherService`, `XverseService`, `EnkryptService`) extends the abstract `WalletService`
(`src/common/services/WalletService.ts`), which handles deriving addresses per account type
(legacy/segwit/native segwit), accumulating balances, and notifying subscribers as UTXOs load —
see [UTXO selection](./utxo-selection.md) for what happens with those UTXOs.

Once the user has an amount and destination, building and signing the actual BTC transaction is
handled by a matching `TxBuilder` implementation under `src/pegin/middleware/TxBuilder/`:

| Wallet | Builder |
|---|---|
| Ledger | `LedgerTxBuilder.ts` |
| Trezor | `TrezorTxBuilder.ts` |
| Leather | `LeatherTxBuilder.ts` |
| Xverse | `XverseTxBuilder.ts` |
| Enkrypt | `EnkryptTxBuilder.ts` |
| Reown-connected BTC wallets | `ReownTxBuilder.ts` |

All of them extend the abstract `TxBuilder` (`src/pegin/middleware/TxBuilder/TxBuilder.ts`),
which builds the normalized transaction via `ApiService.createPeginTx`, assembles the unsigned
raw BTC transaction (`getUnsignedRawTx`), and verifies any change address before the concrete
builder hands it to the wallet to sign (`buildTx`). Which wallet's builder gets instantiated is
selected in `src/pegin/components/create/SendBitcoin.vue`.

## Which wallets support which flow

`Wallet.md` describes each wallet entry with independent `pegin`/`pegout` flags — a wallet can
support BTC signing (peg-in), RSK/EVM signing via Reown (peg-out), or both.
