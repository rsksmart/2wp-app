import TxSigner from "@/services/TxSigner";
import {TransactionSummary, Utxo} from "@/store/peginTx/types";
import {Tx} from "@/services/types";

export default abstract class TxBuilder {
  protected signer!: TxSigner;
  public abstract buildTx(utxoList: Utxo[]): Promise<Tx>;
}
