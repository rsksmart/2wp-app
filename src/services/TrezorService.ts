import TrezorConnect, { GetAddress } from 'trezor-connect';
import * as bitcoin from 'bitcoinjs-lib';
import { Network } from 'bitcoinjs-lib';
import { WalletAddress } from '@/store/peginTx/types';
import * as constants from '@/store/constants';
import { TrezorSignedTx, TrezorTx, Tx } from '@/types';
import WalletService from '@/services/WalletService';
import { EnvironmentAccessor, EnvironmentVariables } from '@/enviroment-accessor';

export default class TrezorService extends WalletService {
  private network: Network;

  constructor(coin: string) {
    super(coin);
    this.network = coin === constants.BTC_NETWORK_MAINNET
      ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    TrezorConnect.manifest({
      email: EnvironmentAccessor.getEnvironmentVariables().vueAppManifestEmail,
      appUrl: EnvironmentAccessor.getEnvironmentVariables().vueAppManifestAppUrl,
    });
  }

  private getAddressesBundle(accountIndex: number, batch: number): GetAddress [] {
    const bundle: GetAddress[] = [];
    for (let index = 0; index < batch; index += 1) {
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_LEGACY_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, false, index),
        showOnTrezor: false,
        coin: this.coin,
      });
      bundle.push({
        path: this.getDerivationPath(constants
          .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, true, index),
        showOnTrezor: false,
        coin: this.coin,
      });
    }
    return bundle;
  }

  public getAddressList(batch: number): Promise<WalletAddress[]> {
    return new Promise((resolve, reject) => {
      const bundle = this.getAddressesBundle(0, batch);
      TrezorConnect.getAddress({
        bundle,
      })
        .then((result) => {
          if (!result.success) reject(new Error(result.payload.error));
          const addresses: WalletAddress[] = [];
          Object.entries(result.payload).forEach((obj) => {
            addresses.push(obj[1]);
          });
          resolve(addresses);
        })
        .catch(reject);
    });
  }

  public getAccountUnusedAddresses(accountType: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      TrezorConnect.getAccountInfo({
        path: this.getAccountPath(accountType, 0),
        coin: this.coin,
        details: 'txs',
      })
        .then((result) => {
          if (!result.success) reject(new Error(result.payload.error));
          const unusedAddresses: string[] = [];
          if ('addresses' in result.payload) {
            const { addresses } = result.payload;
            if (addresses && 'unused' in addresses) {
              Object.entries(addresses.unused)
                .forEach((obj) => {
                  unusedAddresses.push(obj[1].address);
                });
            }
          }
          resolve(unusedAddresses);
        })
        .catch(reject);
    });
  }

  sign(tx: Tx): Promise<TrezorSignedTx> {
    const trezorTx: TrezorTx = tx as TrezorTx;
    return new Promise<TrezorSignedTx>((resolve, reject) => {
      TrezorConnect.signTransaction({
        inputs: trezorTx.inputs,
        outputs: trezorTx.outputs,
        coin: this.coin,
        push: false,
      })
        .then((res) => {
          if (res.success) {
            resolve({
              success: res.success,
              payload: {
                signatures: res.payload.signatures,
                serializedTx: res.payload.serializedTx,
              },
            });
          } else {
            reject(new Error(res.payload.error));
          }
        })
        .catch(reject);
    });
  }

  getUnsignedRawTx(tx: TrezorTx) :string {
    const txBuilder = new bitcoin.TransactionBuilder(this.network);
    tx.inputs.forEach((input) => {
      txBuilder.addInput(input.prev_hash, input.prev_index);
    });
    tx.outputs.forEach((normalizedOutput) => {
      if (normalizedOutput.script_type === 'PAYTOOPRETURN') {
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
}
