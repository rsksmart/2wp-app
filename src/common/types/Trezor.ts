import { PROTO } from '@trezor/connect-web';
import { Tx } from '@/common/types/Common';

export type InputScriptType =
  'SPENDADDRESS' |
  'SPENDWITNESS' |
  'SPENDP2SHWITNESS';

export interface TrezorTx extends Tx {
  coin: string;
  inputs: PROTO.TxInputType[];
  outputs: PROTO.TxOutputType[];
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

export interface GetAddress {
  path: string | number[];
  address?: string;
  showOnTrezor?: boolean;
  coin?: string;
}
