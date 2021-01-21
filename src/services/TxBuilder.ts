import TxSigner from "@/services/TxSigner";
import { Utxo } from "@/store/peginTx/types";
import {normalizedTx, Tx} from "@/services/types";

export default abstract class TxBuilder {
  protected signer!: TxSigner;
  // public abstract buildTx(utxoList: Utxo[], amount: number, feeLevel: string): Promise<Tx>;
  public abstract buildTx(apiTx: normalizedTx): Promise<Tx>;
}
