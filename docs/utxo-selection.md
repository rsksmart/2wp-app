# UTXO selection

Part of [Peg-in](./peg-in.md): before sending BTC, the user can inspect and choose which UTXOs of
the connected BTC wallet fund the transaction, instead of leaving selection fully automatic.

## Components

- `PegInAccountSelect.vue` (`src/pegin/components/create/PegInAccountSelect.vue`) shows the
  connected wallet's name, the selected account type's balance, and a shortcut (pencil icon) into
  the UTXO picker for the current or another address type (legacy/segwit/native segwit).
- `UxtoSelector.vue` (`src/common/components/layouts/UxtoSelector.vue`) is the picker dialog
  itself: a data table listing the UTXOs for the selected account/address type, each one
  individually selectable for the transaction.

## Supporting services (`src/pegin/services/`)

- **`BalanceService.getBalances`** groups the wallet's addresses by type (legacy/segwit/native
  segwit), fetches each group's UTXOs via `ApiService.getUtxos`, and sums them into a balance per
  type — this is what populates the UTXO list `UxtoSelector.vue` renders.
- **`UnusedAddressesService.areUnusedAddresses`** checks whether a given address has ever
  received or sent funds (via `ApiService.getAddressesInfo`) — used by `TxBuilder` (see
  [Wallet connection & signing](./wallet-connection.md)) to verify a change address is safe to
  reuse before finalizing the transaction.
- **`TxFeeService`** (`src/pegin/services/TxFeeService.ts`) estimates the network fee for the
  transaction, which factors into how much of the selected UTXOs' value is needed.
