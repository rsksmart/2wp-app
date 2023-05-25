import { Psbt } from 'bitcoinjs-lib';
import { NormalizedOutput, Tx } from './Common';

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
  inputs: {
    tx: LedgerjsTransaction;
    outputIndex: number;
    publicKey: string;
    hex: string;
  }[];
  outputs: NormalizedOutput[];
  outputScriptHex: string;
  changePath: string;
  associatedKeysets: string[];
  psbtTx?: Psbt;
  accountType: string;
}

export interface LedgerSignedTx {
  signedTx: string;
}
