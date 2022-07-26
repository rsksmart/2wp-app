# [2wp-app] Environment Variables
This table was created to guide and centralize the **environment variables** necessary for correct execution.
The value of these variables are used in **environment-variables.ts** file.

|NAME                                        |DEV VALUE                      |DETAILS                                                  |
|--------------------------------------------|-------------------------------|---------------------------------------------------------|
|VUE_APP_COIN                                |`test or main`                 |'testnet or mainnet'                                     |
|VUE_APP_MANIFEST_EMAIL                      |                               |                                                         |
|VUE_APP_MANIFEST_APP_URL                    |                               |<URL_FOR_TREZOR_MANIFEST> ## 'https://2waypeg.rsk.co/'   |
|VUE_APP_API_BASE_URL                        |                               |API Back-end URL                                         |
|VUE_APP_RSK_NODE_HOST                       |                               |NODE RSK URL                                             | 
|VUE_APP_HOTJAR_ID                           |                               |<HOT_JAR_ID_FOR_THE_ENVIRONMENT>                         |
|VUE_APP_RSK_EXPLORER                        |                               |RSK EXPLORER URL                                         |
|VUE_APP_WALLET_MAX_CALLS_TREZOR             | 10                            |MAX CALLS TREZOR                                         |
|VUE_APP_WALLET_ADDRESSES_PER_CALL_TREZOR    | 1                             |ADDRESSES PER_CALL                                       |
|VUE_APP_WALLET_MAX_CALLS_LEDGER             | 2                             |MAX CALLS LEDGER                                         |
|VUE_APP_WALLET_ADDRESSES_PER_CALL_LEDGER    | 4                             |ADDRESSES PER CALL                                       |
|VUE_APP_WALLET_MAX_CALLS_LIQUALITY          | 10                            |MAX CALLS LIQUALITY                                      |
|VUE_APP_WALLET_ADDRESSES_PER_CALL_LIQUALITY | 1                             |ADDRESSES PER CALL                                       |


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