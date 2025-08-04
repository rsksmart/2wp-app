export interface VaultAccount {
  id: number;
  name: string;
  assets: Array<{
    id: string;
    total: number;
  }>;
}

export interface ApiUser {
  id: number;
  name: string;
  role: string;
}

export interface FireblocksLocalConfig {
  apiKey: string;
  cert: string;
  vaultId: number;
}

export enum TransferPeerPathType {
  VaultAccount = 'VAULT_ACCOUNT',
  ExchangeAccount = 'EXCHANGE_ACCOUNT',
  InternalWallet = 'INTERNAL_WALLET',
  ExternalWallet = 'EXTERNAL_WALLET',
  Contract = 'CONTRACT',
  NetworkConnection = 'NETWORK_CONNECTION',
  FiatAccount = 'FIAT_ACCOUNT',
  Compound = 'COMPOUND',
  GasStation = 'GAS_STATION',
  OneTimeAddress = 'ONE_TIME_ADDRESS',
  Unknown = 'UNKNOWN',
  EndUserWallet = 'END_USER_WALLET',
  ProgramCall = 'PROGRAM_CALL',
  MultiDestination = 'MULTI_DESTINATION',
}

export interface FireblocksTransactionParams {
  assetId: string;
  amount: string;
  source: {
    type: TransferPeerPathType;
    id: string;
  };
  destination: {
    type: TransferPeerPathType;
    subType: string;
    name: string;
    oneTimeAddress: {
      address: string;
      tag: string;
    };
  };
  note: string;
}
