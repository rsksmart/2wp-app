import { TxInputType, TxOutputType } from 'trezor-connect';
import { Network, Psbt } from 'bitcoinjs-lib';

export interface Tx {
  coin: string;
  inputs: object[];
  outputs: object[];
}

export interface NormalizedTx extends Tx {
  coin: string;
  inputs: NormalizedInput[];
  outputs: NormalizedOutput[];
  opReturnData: string;
}

export interface NormalizedInput {
  address: string;
  prev_hash: string;
  amount: string;
  address_n: number[];
  prev_index: number;
  script_type?: string;
  sequence?: number;
}

export interface NormalizedOutput {
  address?: string;
  address_n?: number[];
  amount: string;
  serializedValue?: string;
  op_return_data?: string;
}

export interface TrezorTx extends Tx {
  coin: string;
  inputs: TxInputType[];
  outputs: TxOutputType[];
}

export interface LedgerjsTransaction {
  version: Buffer;
  inputs: {
    prevout: Buffer;
    script: Buffer;
    sequence: Buffer;
    tree?: Buffer;
  }[];
  outputs?: {
    amount: Buffer;
    script: Buffer;
  }[];
  locktime?: Buffer;
  witness?: Buffer;
  timestamp?: Buffer;
  nVersionGroupId?: Buffer;
  nExpiryHeight?: Buffer;
  extraData?: Buffer;
}

export interface LedgerTx extends Tx {
  coin: string;
  inputs: { tx: LedgerjsTransaction; outputIndex: number; publicKey: string; hex: string }[];
  outputs: NormalizedOutput[];
  outputScriptHex: string;
  changePath: string;
  associatedKeysets: string[];
  psbtTx?: Psbt;
  accountType: string;
}

export interface Signer {
  network: Network;
  publicKey: Buffer;
  sign: (hash: any) => Buffer;
}

export type InputScriptType = 'SPENDADDRESS' | 'SPENDMULTISIG' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS';

export interface AccountBalance {
  legacy: number;
  segwit: number;
  nativeSegwit: number;
}

export interface FeeAmountData {
  slow: number;
  average: number;
  fast: number;
}

export interface TxData {
  amount: number;
  refundAddress: string;
  recipient: string;
  change: string;
  feeBTC: number;
}

export interface TrezorSignedTx {
  success: boolean;
  id?: number;
  payload: {
    signatures: string[];
    serializedTx: string;
  };
}
