# [2wp-app] Environment Variables
This table was created to guide and centralize the **environment variables** necessary for correct execution.
The value of these variables are used in **environment-variables.ts** file.

|NAME                                        | DEV VALUE   |DETAILS                                                                                                     |
|--------------------------------------------|-------------|------------------------------------------------------------------------------------------------------------|
|VUE_APP_COIN                                | `test / main` |The network that will be used for the bitcoin library. Accepted values are `test` or `main`                                                          |
|VUE_APP_MANIFEST_EMAIL                      |             |                                                                                                            |
|VUE_APP_MANIFEST_APP_URL                    |             |Trezor connect Manifest is described [here](https://github.com/trezor/connect/blob/develop/docs/index.md)   |
|VUE_APP_API_BASE_URL                        |             |URL of the API (2wp-api) which is the BackEnd                                                               |
|VUE_APP_RSK_NODE_HOST                       |             |RSK node URL to verify RSK data (e.g. POWpeg address| 
|VUE_APP_HOTJAR_ID | |A Hotjar ID is uniquely generated identification, and is described [here](https://help.hotjar.com/hc/en-us/articles/360033640653-Identify-API-Reference)|
|VUE_APP_RSK_EXPLORER                        |             |RSK EXPLORER URL used to verify the transaction status                                                      |
|VUE_APP_WALLET_ADDRESSES_HARD_STOP          | `100`       |Maximum number of addresses derived from wallet                             |
|VUE_APP_WALLET_ADDRESS_PER_CALL             | `5`         |Number of addresses obtained per derivation call                                                                       |
|VUE_APP_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC    | `0.004`     | 0,004 Minimum allowed value for a PEGOUT transaction|
|VUE_APP_PEGOUT_MAX_AMOUNT_ALLOWED_IN_RBTC   | `1`          | 1 Maximum allowed value for a PEGOUT transaction|

## Example for .env.local.test file

```dotenv
VUE_APP_COIN=test
VUE_APP_MANIFEST_EMAIL=
VUE_APP_MANIFEST_APP_URL=
VUE_APP_API_BASE_URL=http://localhost:3000
VUE_APP_RSK_NODE_HOST=
VUE_APP_HOTJAR_ID=
VUE_APP_RSK_EXPLORER=https://explorer.testnet.rsk.co/
VUE_APP_WALLET_ADDRESSES_HARD_STOP=100
VUE_APP_WALLET_ADDRESS_PER_CALL=5
VUE_APP_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC=0.005
VUE_APP_PEGOUT_MAX_AMOUNT_ALLOWED_IN_RBTC=1
```
