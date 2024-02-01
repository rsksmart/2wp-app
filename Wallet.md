# Adding a wallet button for Peg-in

This guide will walk you through the process of adding a new wallet button in the Peg-In option (BTC to RBTC)

## Prerequisites

- Basic knowledge of Vue.js
- Basic knowledge of SCSS

## Steps

1. **Update the Wallets Data**

   Open the JSON file where the wallets data is stored `WalletConf.json` located `src/common` directory.

   Add a new object to the `wallets` array in this file for the new button details. This object should have the following properties:

   - `name`: The name of the wallet.
   - `constant`: The constant defined for the wallet.
   - `icon`: the path to the wallet's default image, relative to the `src/assets` directory.
   - `iconWhite`: The path to the wallet's white image, relative to the `src/assets` directory.
   - `hover`: Set this to `false`.
   - `pegin`: set `true` or `false` if the wallet has bitcoin interaction for pegin process.
   - `pegout`: set `true` or `false` if the wallet has EVM support for Rootstock network.
   - `btnClass`: The class name required to display better (if needed) the wallet button.

   Here's an example of what the new object might look like:

   ```json
   {
     "name": "New Wallet",
     "constant": "NEW_WALLET",
     "icon": "wallet-icons/new.svg",
     "iconWhite": "wallet-icons/new-white.svg",
     "hover": false,
     "pegin": true,
     "pegout": false,
     "btnClass": "btn-new"
   }
   ```
   

2. **Update the SCSS File (if needed)**

   Open the SCSS file where the styles for the buttons are defined located in `src/common/styles/_exchange.scss`.

   Add a new class inside the `.exchange` class with the name defined in the `walletConf.json` file.

   ```scss
   .exchange {
     .btn-new {
        // required rules eg: width: 100px;
      }
   }
   ```

3. **Test Your Changes**

Run locally the project and check if the button shows correctly


4. **Add your wallet in files**

Open file src/common/store/constants.ts adding WALLET_ + the name of the wallet. 

Add the new wallet in this **enum** object.

   ```
   // Supported wallets for pegin
   export const WALLET_NAMES = {
      LEDGER: { short_name: 'ledger', long_name: 'WALLET_LEDGER' },
      TREZOR: { short_name: 'trezor', long_name: 'WALLET_TREZOR' },
      LIQUALITY: { short_name: 'liquality', long_name: 'WALLET_LIQUALITY' },
      METAMASK: { short_name: 'metamask', long_name: 'WALLET_METAMASK' },
      LEATHER: { short_name: 'leather', long_name: 'WALLET_LEATHER' },
      XVERSE: { short_name: 'xverse', long_name: 'WALLET_XVERSE' },
   } as const;
   ```

Open file src/common/types/peginTx.ts
Add your WALLET long name:

```
export type BtcWallet = 'WALLET_LEDGER |
  'WALLET_TREZOR' | 'WALLET_LIQUALITY' | 'WALLET_MYWALLET';
```

Open file src/common/components/exchange/SelectBitcoinWallet.vue
Change function toSendBitcoin() adding your wallet into the switch:

   ```
   case constants.WALLET_MYWALLET
      wallet = constants.WALLET_NAMES.MYWALLET;
      break;
   ```

Open file src/pegin/store/action.js
change the action `[constants.PEGIN_TX_ADD_SESSION_ID]` adding your wallet into the `swich operation`:

```
      case constants.WALLET_MYWALLET:
        commit(constants.PEGIN_TX_SET_WALLET_SERVICE, new MyWalletService());
        break;
```

Import your MyWalletService:
```
import {
  ApiService, LedgerService, LiqualityService, TrezorService, MyWalletService,
} from '@/common/services';
```

5. **Create the wallet service class**

In the previous step you declared the class MyWalletService class, now we need to add this class.

You need to create the MyWalletService class into the **src/common/services** folder.

Export your type adding in the `src/common/services/index.ts`.

6. **Create common errors**

Add your `MyWalletError` into the `src/common/types/exception` folder.

Export your type adding in the `src/common/types/index.ts`.