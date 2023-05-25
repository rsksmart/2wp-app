import { TxInputType, TxOutputType } from 'trezor-connect';
import { Tx } from '@/common/types/Common';

export type InputScriptType =
  'SPENDADDRESS' |
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
