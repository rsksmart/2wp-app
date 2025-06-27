import * as bitcoin from 'bitcoinjs-lib';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  AppNetwork,
  NormalizedInput, NormalizedTx, SatoshiBig, Tx,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import ApiService from '@/common/services/ApiService';
import store from '@/common/store';
import { WalletAddress } from '@/common/types/pegInTx';
import { UnusedAddressesService } from '@/pegin/services';
import { BigNumber } from 'ethers';

export default abstract class TxBuilder {
  protected coin!: AppNetwork;

  protected network: bitcoin.Network;

  constructor() {
    this.coin = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin;
    this.network = this.coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  }

  public abstract buildTx(normalizedTx:NormalizedTx, accountType?: string):
    Promise<Tx>;

  public async getNormalizedTx({
    amountToTransferInSatoshi, refundAddress, recipient,
    feeLevel, changeAddress, sessionId, accountType,
  }:{
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    changeAddress: string;
    sessionId: string;
    accountType: string;
  }): Promise<NormalizedTx> {
    const walletAddresses: WalletAddress[] = store.state.pegInTx?.addressList as WalletAddress[];
    const userAddressList = walletAddresses.map((walletAddress) => walletAddress.address);
    const feeAmountCalculated: SatoshiBig = store.getters[`pegInTx/${constants.PEGIN_TX_GET_SAFE_TX_FEE}`] as SatoshiBig;
    const normalizedTx = await ApiService.createPeginTx(
      amountToTransferInSatoshi,
      refundAddress,
      recipient,
      sessionId,
      feeLevel,
      changeAddress,
      userAddressList,
      feeAmountCalculated,
    );
    const hasChange: boolean = normalizedTx.outputs[2] !== undefined;
    const changeAddr = hasChange && normalizedTx.outputs[2].address
      ? normalizedTx.outputs[2].address : changeAddress;
    if (hasChange && !await this.verifyChangeAddress(
      changeAddr,
      await this.getUnsignedRawTx(normalizedTx),
      walletAddresses,
      accountType,
      normalizedTx.inputs[0],
    )) {
      throw new Error('Error checking the change address');
    }
    return normalizedTx;
  }

  public async getUnsignedRawTx(normalizedTx: NormalizedTx): Promise<string> {
    const txBuilder = new bitcoin.TransactionBuilder(this.network);
    txBuilder.setVersion(constants.BITCOIN_TX_VERSION);
    // eslint-disable-next-line no-restricted-syntax
    for (const input of normalizedTx.inputs) {
      // eslint-disable-next-line no-await-in-loop
      const hexTx = await ApiService.getTxHex(input.prev_hash);
      const prevTx = bitcoin.Transaction.fromHex(hexTx);
      txBuilder.addInput(
        input.prev_hash,
        input.prev_index,
        0,
        prevTx.outs[input.prev_index].script,
      );
    }
    normalizedTx.outputs.forEach((normalizedOutput) => {
      if (normalizedOutput.op_return_data) {
        const buffer = Buffer.from(normalizedOutput.op_return_data, 'hex');
        const script: bitcoin.Payment = bitcoin.payments.embed({ data: [buffer] });
        if (script.output) {
          txBuilder.addOutput(script.output, 0);
        }
      } else if (normalizedOutput.address) {
        txBuilder.addOutput(
          normalizedOutput.address,
          BigNumber.from(normalizedOutput.amount).toNumber(),
        );
      }
    });
    return txBuilder.buildIncomplete()
      .toHex();
  }

  private static isChangeAddressUnused(walletAddress: WalletAddress, accountType: string):
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
    if ((walletAddress.derivationPath.startsWith(`m/${accountTypePath}${coinPath}/0'/1/`))) {
      return UnusedAddressesService.areUnusedAddresses([walletAddress.address])
        .then(([addressStatus]) => addressStatus.unused);
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
    if (await TxBuilder.isChangeAddressUnused(existChangeAddress, accountType)) {
      return true;
    }
    let isUserAddress = false;
    changeAddresses.forEach((walletAddress) => {
      isUserAddress = (walletAddress.address === changeAddress) || isUserAddress;
    });
    if (!isUserAddress) {
      return false;
    }
    const tx = bitcoin.Transaction.fromHex(rawTx);
    const [input] = tx.ins;
    if (!input || !input.hash) {
      return false;
    }
    const prevHash = input.hash.reverse().toString('hex');
    const prevTxHex = await ApiService.getTxHex(prevHash);
    const firstInputPrevTx = bitcoin.Transaction.fromHex(prevTxHex);
    if (prevHash !== firstInputPrevTx.getId()) {
      return false;
    }
    const address = bitcoin.address
      .fromOutputScript(firstInputPrevTx.outs[input.index].script, this.network);
    return (address === txInput.address);
  }
}
