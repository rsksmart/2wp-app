# Adding a wallet button for Peg-in

This guide will walk you through the process of adding a new wallet button in the Peg-In option (BTC to RBTC)

## Prerequisites

- Basic knowledge of Vue.js
- Basic knowledge of SCSS

## Steps

1. **Update the Wallets Data**

   Open the JSON file where the wallets data is stored `walletConf.json` located `src/common` directory.

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
