# [2wp-app] Environment Variables
This table was created to guide and centralize the **environment variables** necessary for correct execution.
The value of these variables are used in **environment-variables.ts** file.

|NAME                                        | DEV VALUE   |DETAILS                                                                                                     |
|--------------------------------------------|-------------|------------------------------------------------------------------------------------------------------------|
|VITE_COIN                                | `test / main` |The network that will be used for the bitcoin library. Accepted values are `test` or `main`                                                          |
|VITE_MANIFEST_EMAIL                      |             |                                                                                                            |
|VITE_MANIFEST_APP_URL                    |             |Trezor connect Manifest is described [here](https://github.com/trezor/connect/blob/develop/docs/index.md)   |
|VITE_API_BASE_URL                        |             |URL of the API (2wp-api) which is the BackEnd                                                               |
|VITE_RSK_NODE_HOST                       |             |RSK node URL to verify RSK data (e.g. POWpeg address| 
|VITE_HOTJAR_ID                           |             |A Hotjar ID is uniquely generated identification, and is described [here](https://help.hotjar.com/hc/en-us/articles/360033640653-Identify-API-Reference)|
|VITE_RSK_EXPLORER                        |             |RSK EXPLORER URL used to verify the transaction status                                                      |
|VITE_WALLET_ADDRESSES_HARD_STOP          | `100`       |Maximum number of addresses derived from wallet                             |
|VITE_WALLET_ADDRESS_PER_CALL             | `5`         |Number of addresses obtained per derivation call                                                                       |
|VITE_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC    | `0.004`     | 0,004 Minimum allowed value for a PEGOUT transaction|
|VITE_PEGOUT_MAX_AMOUNT_ALLOWED_IN_RBTC   | `1`          | 1 Maximum allowed value for a PEGOUT transaction|

## Example for .env.local.test file

```dotenv
VITE_COIN=test
VITE_MANIFEST_EMAIL=
VITE_MANIFEST_APP_URL=
VITE_API_BASE_URL=http://localhost:3000
VITE_RSK_NODE_HOST=
VITE_HOTJAR_ID=
VITE_RSK_EXPLORER=https://explorer.testnet.rsk.co/
VITE_WALLET_ADDRESSES_HARD_STOP=100
VITE_WALLET_ADDRESS_PER_CALL=5
VITE_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC=0.005
VITE_PEGOUT_MAX_AMOUNT_ALLOWED_IN_RBTC=1
```
