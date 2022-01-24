import { TxInputType, TxOutputType } from 'trezor-connect';
import { Tx } from '@/types/Common';

export type InputScriptType =
  'SPENDADDRESS' |
  'SPENDMULTISIG' |
  'SPENDWITNESS' |
  'SPENDP2SHWITNESS';

export interface TrezorTx extends Tx {
  coin: string;
  inputs: TxInputType[];
  outputs: TxOutputType[];
  version: number;
}

export interface TrezorSignedTx {
  success: boolean;
  id?: number;
  payload: {
    signatures: string[];
    serializedTx: string;
  };
}
