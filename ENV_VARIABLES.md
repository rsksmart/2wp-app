# [2wp-app] Environment Variables
This table was created to guide and centralize the **environment variables** necessary for correct execution.
The value of these variables are used in **environment-variables.ts** file.

|NAME                                        |DEV VALUE    |DETAILS                                                                                                     |
|--------------------------------------------|-------------|------------------------------------------------------------------------------------------------------------|
|VUE_APP_COIN                                |`test / main`|The network that will be used 'testnet or mainnet'                                                          |
|VUE_APP_MANIFEST_EMAIL                      |             |                                                                                                            |
|VUE_APP_MANIFEST_APP_URL                    |             |Trezor connect Manifest is described [here](https://github.com/trezor/connect/blob/develop/docs/index.md)   |
|VUE_APP_API_BASE_URL                        |             |URL of the API (2wp-api) which is the BackEnd                                                               |
|VUE_APP_RSK_NODE_HOST                       |             |RSK node URL to obtain Blockchain data about PEGOUT/PEGIN                                                   | 
|VUE_APP_HOTJAR_ID                           |             |A Hotjar ID is uniquely generated identification, and is described [here](https://help.hotjar.com/hc/en-us/articles/360033640653-Identify-API-Reference)|
|VUE_APP_RSK_EXPLORER                        |             |RSK EXPLORER URL used to verify the transaction status                                                      |
|VUE_APP_WALLET_MAX_CALLS_TREZOR             | `10`          |Maximum number of calls on Trezor hardware wallet to obtain address information                             |
|VUE_APP_WALLET_ADDRESSES_PER_CALL_TREZOR    | `1`          |Number of addresses obtained per call                                                                       |
|VUE_APP_WALLET_MAX_CALLS_LEDGER             | `2`           |Maximum number of calls on Ledger hardware wallet to obtain address information                             |
|VUE_APP_WALLET_ADDRESSES_PER_CALL_LEDGER    | `4`           |Number of addresses obtained per call on Ledger                                                             |
|VUE_APP_WALLET_MAX_CALLS_LIQUALITY          | `10`          |Maximum number of calls on Liquality software wallet to obtain address information                          |
|VUE_APP_WALLET_ADDRESSES_PER_CALL_LIQUALITY | `1`           |ANumber of addresses obtained per call on Liquality                                                         |


## Example for .env.local.test file

```dotenv
VUE_APP_COIN=test
VUE_APP_MANIFEST_EMAIL=
VUE_APP_MANIFEST_APP_URL=
VUE_APP_API_BASE_URL=http://localhost:3000
VUE_APP_RSK_NODE_HOST=
VUE_APP_HOTJAR_ID=
VUE_APP_RSK_EXPLORER=https://explorer.testnet.rsk.co/
VUE_APP_WALLET_MAX_CALLS_TREZOR=10
VUE_APP_WALLET_ADDRESSES_PER_CALL_TREZOR=1
VUE_APP_WALLET_MAX_CALLS_LEDGER=2
VUE_APP_WALLET_ADDRESSES_PER_CALL_LEDGER=4
VUE_APP_WALLET_MAX_CALLS_LIQUALITY=10
VUE_APP_WALLET_ADDRESSES_PER_CALL_LIQUALITY=1

```