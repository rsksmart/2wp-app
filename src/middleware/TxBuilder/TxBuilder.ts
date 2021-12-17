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
    this.changeAddr = '';
    this.txAccountType = '';
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
      ).then(async (normalizedTx: NormalizedTx) => {
        this.normalizedTx = normalizedTx;
        const walletAddresses: WalletAddress[] = store.state.pegInTx.addressList as WalletAddress[];
        this.changeAddr = normalizedTx.outputs[2].address
          ? normalizedTx.outputs[2].address : changeAddress;
        if (!this.verifyChangeAddress(
          this.changeAddress,
          await this.getUnsignedRawTx(),
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

  public async getUnsignedRawTx(): Promise<string> {
    const txBuilder = new bitcoin.TransactionBuilder(this.network);
    // eslint-disable-next-line no-restricted-syntax
    for (const input of this.normalizedTx.inputs) {
      // eslint-disable-next-line no-await-in-loop
      const hexTx = await ApiService.getTxHex(input.prev_hash);
      const prevTx = bitcoin.Transaction.fromHex(hexTx);
      txBuilder.addInput(
        input.prev_hash, input.prev_index,
        0, prevTx.outs[input.prev_index].script,
      );
    }
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
    return txBuilder.buildIncomplete()
      .toHex();
  }

  // eslint-disable-next-line class-methods-use-this
  private isChangeAddressUnused(walletAddress: WalletAddress, accountType: string):
    Promise<boolean> {
    let accountTypePath = '';
    const coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    const coinPath = coin === constants.BTC_NETWORK_MAINNET ? "/0'" : "/1'";
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
        throw new Error('Error: invalid account type. ');
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
        script = Buffer.from(tx.ins[0].script.buffer);
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        script = Buffer.from(tx.ins[0].witness[1]);
        break;
      default:
        throw new Error('Error trying to verify change address. Invalid type of account.');
    }
    return (bitcoin.address.fromOutputScript(script, this.network) === txInput.address);
  }
}
