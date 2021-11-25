import * as bitcoin from 'bitcoinjs-lib';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import TxSigner from '@/middleware/TxSigner/TxSigner';
import { NormalizedInput, NormalizedTx, Tx } from '@/types';
import * as constants from '@/store/constants';
import ApiService from '@/services/ApiService';
import store from '@/store';
import { WalletAddress } from '@/store/peginTx/types';

export default abstract class TxBuilder {
  protected signer!: TxSigner;

  protected coin!: string;

  protected network: bitcoin.Network;

  protected normalizedTx!: NormalizedTx;

  protected changeAddr: string;

  private txAccountType: string;

  protected constructor() {
    this.coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    this.network = this.coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    this.txAccountType = constants.BITCOIN_LEGACY_ADDRESS;
    this.changeAddr = '';
  }

  set accountType(accountType: string) {
    this.txAccountType = accountType;
  }

  get accountType() {
    return this.txAccountType;
  }

  public abstract buildTx(): Promise<Tx>;

  get changeAddress(): string {
    return this.changeAddr;
  }

  public getNormalizedTx({
    amountToTransferInSatoshi, refundAddress, recipient, feeLevel, changeAddress, sessionId,
  }:{
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    changeAddress: string;
    sessionId: string;
  }): Promise<NormalizedTx> {
    return new Promise<NormalizedTx>((resolve, reject) => {
      ApiService.createPeginTx(
        amountToTransferInSatoshi, refundAddress, recipient,
        sessionId, feeLevel, changeAddress,
      ).then((normalizedTx: NormalizedTx) => {
        this.normalizedTx = normalizedTx;
        const walletAddresses: WalletAddress[] = store.state.pegInTx.addressList as WalletAddress[];
        if (changeAddress === ''
          && normalizedTx.inputs[0].address !== normalizedTx.outputs[2].address
        ) reject(new Error('Error checking the change address'));
        this.changeAddr = normalizedTx.outputs[2].address
          ? normalizedTx.outputs[2].address : changeAddress;
        if (!this.verifyChangeAddress(
          this.changeAddress,
          this.getUnsignedRawTx(),
          walletAddresses,
          this.accountType,
          normalizedTx.inputs[0],
        )) {
          throw new Error('Error checking the change address');
        }
        resolve(normalizedTx);
      }).catch(reject);
    });
  }

  public getUnsignedRawTx(): string {
    const txBuilder = new bitcoin.TransactionBuilder(this.network);
    this.normalizedTx.inputs.forEach((input) => {
      txBuilder.addInput(input.prev_hash, input.prev_index);
    });
    this.normalizedTx.outputs.forEach((normalizedOutput) => {
      if (normalizedOutput.op_return_data) {
        const buffer = Buffer.from(normalizedOutput.op_return_data, 'hex');
        const script: bitcoin.Payment = bitcoin.payments.embed({ data: [buffer] });
        if (script.output) {
          txBuilder.addOutput(script.output, 0);
        }
      } else if (normalizedOutput.address) {
        txBuilder.addOutput(normalizedOutput.address, Number(normalizedOutput.amount));
      }
    });
    return txBuilder.buildIncomplete().toHex();
  }

  // eslint-disable-next-line class-methods-use-this
  private isChangeAddressUnused(walletAddress: WalletAddress, accountType: string):
    Promise<boolean> {
    let accountTypePath = '';
    const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    const coinPath = coin === 'main' ? "/0'" : "/1'";
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        accountTypePath = "44'";
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        accountTypePath = "49'";
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        accountTypePath = "84'";
        break;
      default:
        accountTypePath = "44'";
    }
    if ((walletAddress.serializedPath.startsWith(`m/${accountTypePath}${coinPath}/0'/1/`))) {
      return (ApiService.areUnusedAddresses([walletAddress.address]));
    }
    return Promise.resolve(false);
  }

  public async verifyChangeAddress(
    changeAddress: string,
    rawTx: string,
    changeAddresses: WalletAddress[],
    accountType: string,
    txInput: NormalizedInput,
  ): Promise<boolean> {
    const existChangeAddress = changeAddresses.find((element) => element.address === changeAddress);
    if (!existChangeAddress) {
      return false;
    }
    if (await this.isChangeAddressUnused(existChangeAddress, accountType)) {
      return true;
    }
    const tx = bitcoin.Transaction.fromHex(rawTx);
    let script: Buffer;
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        script = Buffer.from(tx.ins[0].script);
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        script = Buffer.from(tx.ins[0].witness[1]);
        break;
      default:
        throw new Error('Error trying to verify change address. Invalid type of account type. ');
    }
    return (bitcoin.address.fromOutputScript(script, this.network) === txInput.address);
  }
}
