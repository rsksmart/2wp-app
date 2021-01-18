import TxSigner from "@/services/TxSigner";

export default class TrezorTxSigner extends TxSigner{
  public sign(): boolean {
    return false;
  }

}
