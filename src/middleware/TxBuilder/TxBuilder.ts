import { EnvironmentAccessor } from '@/enviroment-accessor';
import TxSigner from '@/middleware/TxSigner/TxSigner';
import { Tx } from '@/types';

export default abstract class TxBuilder {
  protected signer!: TxSigner;

  protected coin!: string;

  protected constructor() {
    this.coin = EnvironmentAccessor.getEnvironmentVariables().vueAppCoin;
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
