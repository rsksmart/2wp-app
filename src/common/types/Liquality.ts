import { Tx } from '@/common/types/Common';

declare interface walletSendTransactionParams {
  to: string;
  value: number;
}

// eslint-disable-next-line no-shadow
export enum LiqualityMethods {
  GET_ADDRESS = 'wallet_getAddresses',
  SIGN_PSBT = 'wallet_signPSBT',
  SEND_TRANSACTION = 'wallet_sendTransaction',
  SIGN_MESSAGE = 'wallet_signMessage',
  GET_CONNECTED_NETWORK = 'wallet_getConnectedNetwork',
}

export interface LiqualityInput {
  index: number;
  derivationPath: string;
}

export interface LiqualityRequestArgs {
  method: LiqualityMethods;
  // eslint-disable-next-line max-len
  params: Array<number | boolean> | Array<walletSendTransactionParams> | Array<string | Array<LiqualityInput>>;
}

export interface LiqualityAddress {
  address: string;
  derivationPath: string;
  publicKey: string;
}

export interface LiqualityGetAddressesResponse {
  address: string;
  derivationPath: string;
  publicKey: string;
  index: number;
}

export interface LiqualityGetNetworkResponse {
  isTestnet: boolean;
}

export type LiqualitySignPsbtResponse = string;
export type LiqualityResponse = Array<LiqualityGetAddressesResponse> |
                                LiqualitySignPsbtResponse |
                                LiqualityGetNetworkResponse;

export interface LiqualityTx extends Tx {
  inputs: Array<LiqualityInput>;
  base64UnsignedPsbt: string;
}

export interface WindowBitcoinProvider {
  request(args:LiqualityRequestArgs): Promise<LiqualityResponse>;
  enable(): Promise<Array<LiqualityAddress>>;
}
export interface LiqualitySignedTx {
  signedTx: string;
}

declare global {
  interface Window {
    bitcoin: WindowBitcoinProvider;
  }
}
