# [PowPeg app] Environment Variables
This table was created to guide and centralize the **environment variables** necessary for correct execution.
The value of these variables are used in **environment-variables.ts** file.

|NAME                                         | DEV VALUE     | DETAILS                                                               |
|---------------------------------------------|---------------|-----------------------------------------------------------------------|
|VUE_APP_COIN                                 | `test / main` | The network that will be used for the bitcoin library. Accepted values are `test` or `main`         |
|VUE_APP_MANIFEST_EMAIL                       |         |                                                                             |
|VUE_APP_MANIFEST_APP_URL                     |         | Trezor connect Manifest is described [here](https://github.com/trezor/connect/blob/develop/docs/index.md) |
|VUE_APP_API_BASE_URL                         |         | URL of the API (2wp-api) which is the BackEnd                               |
|VUE_APP_RSK_NODE_HOST                        |         | RSK node URL to verify RSK data (e.g. POWpeg address                        | 
|VUE_APP_CLARITY_ID                           |         | A Clarity ID is uniquely generated identification for app usage metrics     |
|VUE_APP_RSK_EXPLORER                         |         | RSK EXPLORER URL used to verify the transaction status                      |
|VUE_APP_WALLET_ADDRESSES_HARD_STOP           | `100`   | Maximum number of addresses derived from wallet                             |
|VUE_APP_WALLET_ADDRESS_PER_CALL              | `5`     | Number of addresses obtained per derivation call                            |
|VUE_APP_PEGOUT_MIN_AMOUNT_ALLOWED_IN_RBTC    | `0.004` | Minimum allowed value for a PEGOUT transaction                              |
|VUE_APP_PEGIN_MIN_AMOUNT_ALLOWED_IN_BTC      | `0.005` | Minimum allowed value for a PEGIN transaction                               |
|VUE_APP_BURN_DUST_VALUE                      | `30000` | Max value to burn in the tx fee                                             |
|VUE_APP_MIN_FEE_SAT_PER_BYTE_FAST            | `8`     | Min fee rate (sats/byte) required to broadcast the transaction              |
|VUE_APP_MIN_FEE_SAT_PER_BYTE_AVG             | `4`     | Min fee rate (sats/byte) required to broadcast the transaction              |
|VUE_APP_MIN_FEE_SAT_PER_BYTE_SLOW            | `1`     | Min fee rate (sats/byte) required to broadcast the transaction              |
|VUE_APP_LBC_ADDRESS   | `0xc2A630c053D12D63d32b025082f6Ba268db18300` | Liquidity bridge contract address on the flyover protocol     |
|VUE_APP_DEBUG_MODE                           | `false` | enable developer messages for debuging                                      |
|VUE_APP_FLYOVER_PEGOUT_QUOTE_DIFF_PERCENTAGE | `2`  | Defines quote difference percentage to 2% so it requieres the user to review condition only for a difference bigger that this percentage |
|VUE_APP_RECAPTCHA_NEW_TOKEN_TIME             | `30`    |  Specifies the time (in seconds) to temporarily disable the flyover between new transactions. This accounts for the time required by Google reCAPTCHA to regenerate a challenge token |
|VUE_APP_FLYOVER_PROVIDER_ID                  | `1`     | Sets up the provider id to be use for flyover status search.                |
|VUE_APP_FLYOVER_GET_PROVIDERS_TIMEOUT        | `5000`  | Sets a timeout for calls made to get liquidity providers.                   |
|VUE_APP_API_RESPONSE_TIMEOUT                 | `10000` | Sets a timeout for calls made to API on search transaction.                 |
|VUE_APP_REOWN_PROJECT_ID  | `PROJECT_ID` | Reown's AppKit project Id follow [this](https://reown.com/blog/how-to-get-started-with-appkit) instructions to get one. |

Example for [.env.local.test](https://github.com/rsksmart/2wp-app/blob/main/.env.local.test) file.
