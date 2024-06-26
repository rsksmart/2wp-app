export const WALLET_NAMES = {
  LEDGER: { formal_name: 'Ledger', short_name: 'ledger', long_name: 'WALLET_LEDGER' },
  TREZOR: { formal_name: 'Trezor', short_name: 'trezor', long_name: 'WALLET_TREZOR' },
  METAMASK: { formal_name: 'Metamask', short_name: 'metamask', long_name: 'WALLET_METAMASK' },
  LEATHER: { formal_name: 'Leather', short_name: 'leather', long_name: 'WALLET_LEATHER' },
} as const;

export const OPERATION_TYPE = 'OPERATION_TYPE';
export const OPERATION_AMOUNT = 'OPERATION_AMOUNT';

export const DERIVE_BTC_ADDRESS_DOCUMENTATION_URL = 'https://dev.rootstock.io/guides/two-way-peg-app/pegout/deriving-electrum/';
export const RLOGIN_METAMASK_WALLET = 'MetaMask';

export const TOTAL_RBTC_STOCK = 21000000;

// devices
export const IS_TREZOR_CONNECTED = 'IS_TREZOR_CONNECTED';

// Transaction Type
export const PEG_IN_TRANSACTION_TYPE = 'PEG_IN_TRANSACTION_TYPE';
export const PEG_OUT_TRANSACTION_TYPE = 'PEG_OUT_TRANSACTION_TYPE';

// accounts
export const BITCOIN_LEGACY_ADDRESS = 'BITCOIN_LEGACY_ADDRESS';
export const BITCOIN_SEGWIT_ADDRESS = 'BITCOIN_SEGWIT_ADDRESS';
export const BITCOIN_NATIVE_SEGWIT_ADDRESS = 'BITCOIN_NATIVE_SEGWIT_ADDRESS';
export const BITCOIN_MULTISIGNATURE_ADDRESS = 'BITCOIN_MULTISIGNATURE_ADDRESS';
export const BITCOIN_UNKNOWN_ADDRESS_TYPE = 'BITCOIN_UNKNOWN_ADDRESS_TYPE';

// Fee Level
export const BITCOIN_SLOW_FEE_LEVEL = 'BITCOIN_SLOW_FEE_LEVEL';
export const BITCOIN_AVERAGE_FEE_LEVEL = 'BITCOIN_AVERAGE_FEE_LEVEL';
export const BITCOIN_FAST_FEE_LEVEL = 'BITCOIN_FAST_FEE_LEVEL';

// Pegin tx Actions
export const PEGIN_TX_ADD_ADDRESSES = 'PEGIN_TX_ADD_ADDRESSES';
export const PEGIN_TX_ADD_UTXOS = 'PEGIN_TX_ADD_UTXOS';
export const PEGIN_TX_ADD_SESSION_ID = 'PEGIN_TX_ADD_SESSION_ID';
export const PEGIN_TX_ADD_PEGIN_CONFIGURATION = 'PEGIN_TX_ADD_PEGIN_CONFIGURATION';
export const PEGIN_TX_ADD_BITCOIN_WALLET = 'PEGIN_TX_ADD_BITCOIN_WALLET';
export const PEGIN_TX_ADD_BITCOIN_PRICE = 'PEGIN_TX_ADD_BITCOIN_PRICE';
export const PEGIN_TX_CLEAR_STATE = 'PEGIN_TX_CLEAR_STATE';
export const PEGIN_TX_SELECT_ACCOUNT_TYPE = 'PEGIN_TX_SELECT_ACCOUNT_TYPE';
export const PEGIN_TX_ADD_AMOUNT_TO_TRANSFER = 'PEGIN_TX_ADD_AMOUNT_TO_TRANSFER';
export const PEGIN_TX_CALCULATE_TX_FEE = 'PEGIN_TX_CALCULATE_TX_FEE';
export const PEGIN_TX_ADD_BALANCE = 'PEGIN_TX_ADD_BALANCE';
export const PEGIN_TX_ADD_RSK_ADDRESS = 'PEGIN_TX_ADD_RSK_ADDRESS';
export const PEGIN_TX_SELECT_FEE_LEVEL = 'PEGIN_TX_SELECT_FEE_LEVEL';
export const PEGIN_TX_ADD_IS_VALID_AMOUNT = 'PEGIN_TX_ADD_IS_VALID_AMOUNT';
export const PEGIN_TX_ADD_NORMALIZED_TX = 'PEGIN_TX_ADD_NORMALIZED_TX';
export const PEGIN_TX_START_ASKING_FOR_BALANCE = 'PEGIN_TX_START_ASKING_FOR_BALANCE';
export const PEGIN_TX_STOP_ASKING_FOR_BALANCE = 'PEGIN_TX_STOP_ASKING_FOR_BALANCE';
export const PEGIN_TX_ADD_STATUS_SAFE_FEE = 'PEGIN_TX_ADD_STATUS_SAFE_FEE';
export const PEGIN_TX_ADD_STATUS_REFUND_ADDRESS = 'PEGIN_TX_ADD_STATUS_REFUND_ADDRESS';
export const PEGIN_TX_ADD_STATUS_TX_ID = 'PEGIN_TX_ADD_STATUS_TX_ID';

// PegOut actions
export const PEGOUT_TX_INIT = 'PEGOUT_TX_INIT';
export const PEGOUT_TX_CLEAR = 'PEGOUT_TX_CLEAR';
export const PEGOUT_TX_SELECT_FEE_LEVEL = 'PEGOUT_TX_SELECT_FEE_LEVEL';
export const PEGOUT_TX_ADD_AMOUNT = 'PEGOUT_TX_ADD_AMOUNT';
export const PEGOUT_TX_CALCULATE_FEE = 'PEGOUT_TX_CALCULATE_FEE';
export const PEGOUT_TX_ADD_VALID_AMOUNT = 'PEGOUT_TX_ADD_VALID_AMOUNT';
export const PEGOUT_TX_ADD_PEGOUT_CONFIGURATION = 'PEGOUT_TX_ADD_PEGOUT_CONFIGURATION';
export const PEGOUT_TX_SET_PEGOUT_CONFIGURATION = 'PEGOUT_TX_SET_PEGOUT_CONFIGURATION';
export const PEGOUT_TX_SEND = 'PEGOUT_TX_SEND';

// Flyover PegOut actions
export const FLYOVER_PEGOUT_INIT = 'FLYOVER_PEGOUT_INIT';
export const FLYOVER_PEGOUT_GET_PROVIDERS = 'FLYOVER_PEGOUT_GET_PROVIDERS';
export const FLYOVER_PEGOUT_ADD_AMOUNT = 'FLYOVER_PEGOUT_ADD_AMOUNT';
export const FLYOVER_PEGOUT_GET_QUOTES = 'FLYOVER_PEGOUT_GET_QUOTES';
export const FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER = 'FLYOVER_PEGOUT_USE_LIQUIDITY_PROVIDER';
export const FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE = 'FLYOVER_PEGOUT_ACCEPT_AND_SEND_QUOTE';
export const FLYOVER_PEGOUT_CLEAR_STATE = 'FLYOVER_PEGOUT_CLEAR_STATE';
export const FLYOVER_PEGOUT_ADD_BTC_ADDRESS = 'FLYOVER_PEGOUT_ADD_BTC_ADDRESS';
export const FLYOVER_PEGOUT_GET_FINAL_QUOTE = 'FLYOVER_PEGOUT_GET_FINAL_QUOTE';
export const FLYOVER_PEGOUT_CLEAR_QUOTES = 'FLYOVER_PEGOUT_CLEAR_QUOTES';
export const FLYOVER_PEGOUT_SET_SELECTED_QUOTE_HASH = 'FLYOVER_PEGOUT_SET_SELECTED_QUOTE_HASH';

// View actions
export const VIEW_ADD_CURRENT_VIEW = 'VIEW_ADD_CURRENT_VIEW';

// Flyover PegIn actions

export const FLYOVER_PEGIN_INIT = 'FLYOVER_PEGIN_INIT';
export const FLYOVER_PEGIN_GET_PROVIDERS = 'FLYOVER_PEGIN_GET_PROVIDERS';
export const FLYOVER_PEGIN_ADD_AMOUNT = 'FLYOVER_PEGIN_ADD_AMOUNT';
export const FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS = 'FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS';
export const FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER = 'FLYOVER_PEGIN_USE_LIQUIDITY_PROVIDER';
export const FLYOVER_PEGIN_GET_QUOTES = 'FLYOVER_PEGIN_GET_QUOTES';

// Session actions
export const WEB3_SESSION_GET_ACCOUNT = 'WEB3_SESSION_GET_ACCOUNT';
export const SESSION_CONNECT_WEB3 = 'SESSION_CONNECT_WEB3';
export const SESSION_ADD_TX_TYPE = 'SESSION_ADD_TX_TYPE';
export const WEB3_SESSION_ADD_BALANCE = 'WEB3_SESSION_ADD_BALANCE';
export const SESSION_SIGN_MESSAGE = 'SESSION_SIGN_MESSAGE';
export const SESSION_ADD_BITCOIN_PRICE = 'SESSION_ADD_BITCOIN_PRICE';
export const SESSION_CLEAR = 'SESSION_CLEAR';
export const SESSION_ADD_TERMS_VALUE = 'SESSION_ADD_TERMS_VALUE';
export const SESSION_ADD_TERMS_AND_CONDITIONS_ENABLED = 'SESSION_ADD_TERMS_AND_CONDITIONS_ENABLED';
export const SESSION_SWITCH_LOCALE = 'SESSION_SWITCH_LOCALE';
export const SESSION_ADD_FEATURES = 'SESSION_ADD_FEATURES';
export const SESSION_ADD_API_VERSION = 'SESSION_ADD_API_VERSION';

// Pegin tx Mutations
export const PEGIN_TX_SET_ADDRESS_LIST = 'PEGIN_TX_SET_ADDRESS_LIST';
export const PEGIN_TX_SET_UTXO_LIST = 'PEGIN_TX_SET_UTXO_LIST';
export const PEGIN_TX_SET_TREZOR_CONNECTED = 'PEGIN_TX_SET_TREZOR_CONNECTED';
export const PEGIN_TX_SET_SESSION_ID = 'PEGIN_TX_SET_SESSION_ID';
export const PEGIN_TX_SET_PEGIN_CONFIGURATION = 'PEGIN_TX_SET_PEGIN_CONFIGURATION';
export const PEGIN_TX_SET_BITCOIN_WALLET = 'PEGIN_TX_SET_BITCOIN_WALLET';
export const PEGIN_TX_SET_BITCOIN_PRICE = 'PEGIN_TX_SET_BITCOIN_PRICE';
export const PEGIN_TX_INIT = 'PEGIN_TX_INIT';
export const PEGIN_TX_CLEAR = 'PEGIN_TX_CLEAR';
export const PEGIN_TX_SET_ACCOUNT_TYPE = 'PEGIN_TX_SET_ACCOUNT_TYPE';
export const PEGIN_TX_SET_AMOUNT_TO_TRANSFER = 'PEGIN_TX_SET_AMOUNT_TO_TRANSFER';
export const PEGIN_TX_SET_CALCULATED_TX_FEE = 'PEGIN_TX_SET_CALCULATED_TX_FEE';
export const PEGIN_TX_SET_BALANCE = 'PEGIN_TX_SET_BALANCE';
export const PEGIN_TX_SET_RSK_ADDRESS = 'PEGIN_TX_SET_RSK_ADDRESS';
export const PEGIN_TX_SET_SELECTED_FEE_LEVEL = 'PEGIN_TX_SET_SELECTED_FEE_LEVEL';
export const PEGIN_TX_SET_IS_VALID_AMOUNT = 'PEGIN_TX_SET_IS_VALID_AMOUNT';
export const PEGIN_TX_SET_LOADING_FEE = 'PEGIN_TX_SET_LOADING_FEE';
export const PEGIN_TX_SET_NORMALIZED_TX = 'PEGIN_TX_SET_NORMALIZED_TX';
export const PEGIN_TX_SET_WALLET_SERVICE = 'PEGIN_TX_SET_WALLET_SERVICE';
export const PEGIN_TX_SET_LOADING_BALANCE = 'PEGIN_TX_SET_LOADING_BALANCE';
export const PEGIN_TX_WALLET_SERVICE_SUBSCRIBE = 'PEGIN_TX_WALLET_SERVICE_SUBSCRIBE';
export const PEGIN_TX_SET_STATUS_SAFE_FEE = 'PEGIN_TX_SET_STATUS_SAFE_FEE';
export const PEGIN_TX_SET_STATUS_REFUND_ADDRESS = 'PEGIN_TX_SET_STATUS_REFUND_ADDRESS';
export const PEGIN_TX_SET_STATUS_TX_ID = 'PEGIN_TX_SET_STATUS_TX_ID';

// PegOut mutations
export const PEGOUT_TX_SET_SELECTED_FEE_LEVEL = 'PEGOUT_TX_SET_SELECTED_FEE_LEVEL';
export const PEGOUT_TX_SET_AMOUNT = 'PEGOUT_TX_SET_AMOUNT';
export const PEGOUT_TX_SET_VALID_AMOUNT = 'PEGOUT_TX_SET_VALID_AMOUNT';
export const PEGOUT_TX_SET_TX_HASH = 'PEGOUT_TX_SET_TX_HASH';
export const PEGOUT_TX_SET_BTC_ESTIMATED_FEE = 'PEGOUT_TX_SET_BTC_ESTIMATED_FEE';
export const PEGOUT_TX_SET_RSK_ESTIMATED_FEE = 'PEGOUT_TX_SET_RSK_ESTIMATED_FEE';
export const PEGOUT_TX_SET_GAS = 'PEGOUT_TX_SET_GAS';
export const PEGOUT_TX_SET_EFECTIVE_FEE = 'PEGOUT_TX_SET_EFECTIVE_FEE';
export const PEGOUT_TX_CLEAR_STATE = 'PEGOUT_TX_CLEAR_STATE';

// Flyover PegOut mutations
export const FLYOVER_PEGOUT_SET_SERVICE = 'FLYOVER_PEGOUT_SET_SERVICE';
export const FLYOVER_PEGOUT_SET_PROVIDERS = 'FLYOVER_PEGOUT_SET_PROVIDERS';
export const FLYOVER_PEGOUT_SET_AMOUNT = 'FLYOVER_PEGOUT_SET_AMOUNT';
export const FLYOVER_PEGOUT_SET_QUOTES = 'FLYOVER_PEGOUT_SET_QUOTES';
export const FLYOVER_PEGOUT_SET_LIQUIDITY_PROVIDER = 'FLYOVER_PEGOUT_SET_LIQUIDITY_PROVIDER';
export const FLYOVER_PEGOUT_SET_CLEAR_STATE = 'FLYOVER_PEGOUT_SET_CLEAR_STATE';
export const FLYOVER_PEGOUT_SET_BTC_ADDRESS = 'FLYOVER_PEGOUT_SET_BTC_ADDRESS';
export const FLYOVER_PEGOUT_SET_TX_HASH = 'FLYOVER_PEGOUT_SET_TX_HASH';
export const FLYOVER_PEGOUT_SET_SELECTED_QUOTE = 'FLYOVER_PEGOUT_SET_SELECTED_QUOTE';
export const FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCES = 'FLYOVER_PEGOUT_SET_QUOTES_DIFFERENCES';

// View mutations
export const VIEW_SET_CURRENT_VIEW = 'VIEW_SET_CURRENT_VIEW';

// Flyover PegIn mutations

export const FLYOVER_PEGIN_SET_PROVIDERS = 'FLYOVER_PEGIN_SET_PROVIDERS';
export const FLYOVER_PEGIN_SET_AMOUNT = 'FLYOVER_PEGIN_SET_AMOUNT';
export const FLYOVER_PEGIN_SET_ROOTSTOCK_ADDRESS = 'FLYOVER_PEGIN_SET_ROOTSTOCK_ADDRESS';
export const FLYOVER_PEGIN_SET_QUOTES = 'FLYOVER_PEGIN_SET_QUOTES';

// Session mutations
export const SESSION_SET_ACCOUNT = 'SESSION_SET_ACCOUNT';
export const SESSION_SET_WEB3_INSTANCE = 'SESSION_SET_WEB3_INSTANCE';
export const SESSION_IS_ENABLED = 'SESSION_IS_ENABLED';
export const WEB3_SESSION_CLEAR_ACCOUNT = 'WEB3_SESSION_CLEAR_ACCOUNT';
export const SESSION_SET_RLOGIN = 'SESSION_SET_RLOGIN';
export const SESSION_SET_RLOGIN_INSTANCE = 'SESSION_SET_RLOGIN_INSTANCE';
export const SESSION_CLOSE_RLOGIN = 'SESSION_CLOSE_RLOGIN';
export const SESSION_SET_TX_TYPE = 'SESSION_SET_TX_TYPE';
export const WEB3_SESSION_SET_BALANCE = 'WEB3_SESSION_SET_BALANCE';
export const SESSION_SET_BTC_ACCOUNT = 'SESSION_SET_BTC_ACCOUNT';
export const SESSION_SET_BITCOIN_PRICE = 'SESSION_SET_BITCOIN_PRICE';
export const SESSION_CLEAR_STATE = 'SESSION_CLEAR_STATE';
export const SESSION_SET_TERMS_ACCEPTED = 'SESSION_SET_TERMS_ACCEPTED';
export const SESSION_SET_LOCALE = 'SESSION_SET_LOCALE';
export const SESSION_SET_FEATURES = 'SESSION_SET_FEATURES';
export const SESSION_GET_RBTC_GAS_FEE = 'SESSION_GET_RBTC_GAS_FEE';
export const SESSION_SET_API_VERSION = 'SESSION_SET_API_VERSION';

// Pegin tx getters
export const WALLET_NAME = 'WALLET_NAME';
export const PEGIN_TX_GET_CHANGE_ADDRESS = 'PEGIN_TX_GET_CHANGE_ADDRESS';
export const PEGIN_TX_GET_BIP44_DERIVATION_PATH_FROM_ADDRESS = 'PEGIN_TX_GET_BIP44_DERIVATION_PATH_FROM_ADDRESS';
export const PEGIN_TX_GET_REFUND_ADDRESS = 'PEGIN_TX_GET_REFUND_ADDRESS';
export const PEGIN_TX_GET_ADDRESS_PUBLIC_KEY = 'PEGIN_TX_GET_ADDRESS_PUBLIC_KEY';
export const PEGIN_TX_GET_SAFE_TX_FEE = 'PEGIN_TX_GET_SAFE_TX_FEE';
export const PEGIN_TX_GET_WALLET_SERVICE = 'PEGIN_TX_GET_WALLET_SERVICE';
export const PEGIN_TX_GET_SELECTED_BALANCE = 'PEGIN_TX_GET_SELECTED_BALANCE';
export const PEGIN_TX_GET_DERIVATION_PATH_FROM_ADDRESS = 'PEGIN_TX_GET_DERIVATION_PATH_FROM_ADDRESS';
export const PEGIN_TX_GET_STATUS_TX_ID = 'PEGIN_TX_GET_STATUS_TX_ID';
export const PEGIN_TX_IS_ENOUGH_BALANCE = 'PEGIN_TX_IS_ENOUGH_BALANCE';
export const PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT = 'PEGIN_TX_GET_ACCOUNT_BALANCE_TEXT';
export const PEGIN_TX_GET_ACCOUNT_UTXO_LIST = 'PEGIN_TX_GET_ACCOUNT_UTXO_LIST';
export const PEGIN_TX_GET_SELECTED_UTXO_LIST = 'PEGIN_TX_GET_SELECTED_UTXO_LIST';

// PegOut tx getters
export const PEGOUT_TX_GET_SAFE_TX_FEE = 'PEGOUT_TX_GET_SAFE_TX_FEE';
export const PEGOUT_TX_IS_ENOUGH_BALANCE = 'PEGOUT_TX_IS_ENOUGH_BALANCE';
export const PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE = 'PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE';

export const PEGOUT_TX_EVENT_TRANSACTION_HASH = 'transactionHash';
export const PEGIN_TX_GET_ENOUGH_FEE_VALUE = 'PEGIN_TX_GET_ENOUGH_FEE_VALUE';

// View getters
export const VIEW_GET_CURRENT_VIEW = 'VIEW_GET_CURRENT_VIEW';
export const PEGIN_TX_IS_HD_WALLET = 'PEGIN_TX_IS_HD_WALLET';
export const PEGIN_TX_IS_SF_WALLET = 'PEGIN_TX_IS_SF_WALLET';

// Session getters
export const SESSION_IN_TX_FLOW = 'SESSION_IN_TX_FLOW';
export const SESSION_IS_LEDGER_CONNECTED = 'SESSION_IS_LEDGER_CONNECTED';
export const SESSION_IS_TREZOR_CONNECTED = 'SESSION_IS_TREZOR_CONNECTED';
export const SESSION_IS_METAMASK_CONNECTED = 'SESSION_IS_METAMASK_CONNECTED';
export const SESSION_IS_RLOGIN_DEFINED = 'SESSION_IS_RLOGIN_DEFINED';
export const SESSION_IS_ACCOUNT_CONNECTED = 'SESSION_IS_ACCOUNT_CONNECTED';
export const SESSION_GET_FEATURE = 'SESSION_GET_FEATURE';

// Flyover PegOut getters
export const FLYOVER_PEGOUT_GET_PROVIDER_ID = 'FLYOVER_PEGOUT_GET_PROVIDER_ID';
export const FLYOVER_PEGOUT_GET_SELECTED_QUOTE = 'FLYOVER_PEGOUT_GET_SELECTED_QUOTE';
export const FLYOVER_PEGOUT_GET_MIN_MAX_VALUES = 'FLYOVER_PEGOUT_GET_MIN_MAX_VALUES';

// environment
export const BTC_NETWORK_MAINNET = 'main';
export const BTC_NETWORK_TESTNET = 'test';
export const BITCOIN_TX_VERSION = 1;
// Ledger Apps
export const LEDGER_APP_BTC_TEST = 'Bitcoin Test';
export const LEDGER_APP_BTC = 'Bitcoin';
// xpub versions. (source @ledgerhq/currencies)
export const LEDGER_BTC_MAIN_XPUB_VERSION = 0x0488b21e;
export const LEDGER_BTC_TEST_XPUB_VERSION = 0x043587cf;
// federation address
export const BRIDGE_CONTRACT_ADDRESS = '0x0000000000000000000000000000000001000006';

// Status actions
export const STATUS_GET_TX_STATUS = 'STATUS_GET_TX_STATUS';
export const STATUS_CLEAR = 'STATUS_CLEAR';
export const PEGOUT_TX_ADD_BITCOIN_PRICE = 'PEGOUT_TX_ADD_BITCOIN_PRICE';
export const STATUS_GET_ESTIMATED_FEE = 'STATUS_GET_ESTIMATED_FEE';
export const STATUS_GET_ESTIMATED_RELEASE_TIME_IN_MINUTES = 'STATUS_GET_ESTIMATED_RELEASE_TIME_IN_MINUTES';

// Status mutations
export const STATUS_SET_TX_DETAILS = 'STATUS_SET_TX_DETAILS';
export const STATUS_SET_TX_TYPE = 'STATUS_SET_TX_TYPE';
export const STATUS_SET_CLEAR = 'STATUS_SET_CLEAR';
export const STATUS_SET_BTC_ESTIMATED_FEE = 'STATUS_SET_BTC_ESTIMATED_FEE';
export const STATUS_SET_ESTIMATED_RELEASE_TIME_IN_MINUTES = 'STATUS_SET_ESTIMATED_RELEASE_TIME_IN_MINUTES';

// Status getters
export const STATUS_IS_REJECTED = 'STATUS_IS_REJECTED';
export const STATUS_GET_ACTIVE_MESSAGE = 'STATUS_GET_ACTIVE_MESSAGE';
export const STATUS_GET_RELEASE_TIME_TEXT = 'STATUS_GET_RELEASE_TIME_TEXT';
export const PEGOUT_TX_SET_BITCOIN_PRICE = 'PEGOUT_TX_SET_BITCOIN_PRICE';
export const MAX_ADJACENT_UNUSED_ADDRESSES = 20;

export enum PegStatus {
  WAITING_CONFIRMATIONS = 'WAITING_CONFIRMATIONS',
  CONFIRMED = 'CONFIRMED',
  REJECTED_NO_REFUND = 'REJECTED_NO_REFUND',
  REJECTED_REFUND = 'REJECTED_REFUND',
  NOT_IN_BTC_YET = 'NOT_IN_BTC_YET',
  NOT_IN_RSK_YET = 'NOT_IN_RSK_YET',
  ERROR_NOT_A_PEGIN = 'ERROR_NOT_A_PEGIN',
  ERROR_BELOW_MIN = 'ERROR_BELOW_MIN',
  ERROR_UNEXPECTED = 'ERROR_UNEXPECTED',
}

export enum FlyoverPegoutStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export const LEDGER_STATUS_CODES = {
  TRANSACTION_CANCELLED_BY_USER: 27013,
  DEVICE_LOCKED: 27010,
  USER_EXITED_APP: 27906,
};

export const SUPPORTED_NETWORKS = {
  RSK_MAINNET: {
    chainId: 30,
    rpcUrl: 'https://public-node.rsk.co',
    explorerUrl: 'https://explorer.rootstock.io/',
  },
  RSK_TESTNET: {
    chainId: 31,
    rpcUrl: 'https://public-node.testnet.rsk.co',
    explorerUrl: 'https://explorer.testnet.rootstock.io/',
  },
};

export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false';
// Peg-out status
export const PEGOUT_SIGNING_BLOCKS_GAP = 30;
export const PEGOUT_REQUIRED_CONFIRMATIONS = 4000;
export const BLOCKS_PER_YEAR = 1237553;

// pegin tx
/**
 * taken from: https://en.bitcoin.it/wiki/Transaction#General_format_of_a_Bitcoin_transaction_.28inside_a_block.29
 * Tx header: 10 (generic header) + inputs count (is a varint, it will be usually 1 byte,
 * with 2 bytes we should be covered) + 1 byte (outputs count)
 * inputs: 32 (prev tx hash) + 4 (prev tx output index) + ~70 (signature, 71 to be sure)
 * + 34 (public key) + 4 (sequence nbr)
 * outputs: 8 (value) + 24 (output script)
 */
export const BITCOIN_TX_HEADER_SIZE_IN_BYTES = 13;
export const BITCOIN_TX_OUTPUT_SIZE_IN_BYTES = 32;
export const BITCOIN_TX_INPUT_SIZE_IN_BYTES = 145;

export const BITCOIN_MIN_SATOSHI_FEE = 280;
export const BITCOIN_MAX_SATOSHI_FEE = 5000000;

export const BURN_DUST_MAX_VALUE = 30000;

// Account regex types
export const TESTNET_ADDRESS_LEGACY = '^[mn][1-9A-HJ-NP-Za-km-z]{26,35}';
export const TESTNET_ADDRESS_SEGWIT = '^[2][1-9A-HJ-NP-Za-km-z]{26,35}';
export const TESTNET_ADDRESS_NSEGWIT = '^[tb1][0-9A-HJ-NP-Za-z]{41,62}';

export const MAINNET_ADDRESS_LEGACY = '^[1][1-9A-HJ-NP-Za-km-z]{26,35}';
export const MAINNET_ADDRESS_SEGWIT = '^[3][1-9A-HJ-NP-Za-km-z]{26,35}';
export const MAINNET_ADDRESS_NSEGWIT = '^[bc1][0-9A-HJ-NP-Za-z]{41,62}';

export const POWPEG_RSKT_HEADER = '52534b5401';
export const PEGIN_OUTPUTS = 3;
export const COOKIE_EXPIRATION_HOURS = 12;

export const POWPEG = 'powpeg';
export const FLYOVER = 'flyover';
