import TxSigner from '@/services/TxSigner';
import { Tx } from '@/services/types';

export default abstract class TxBuilder {
  protected signer!: TxSigner;

  protected coin!: string;

  constructor() {
    this.coin = process.env.VUE_APP_COIN ?? 'test';
  }

  public abstract buildTx(apiTx: {
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    changeAddress: string;
    sessionId: string;
  }): Promise<Tx>;
}
