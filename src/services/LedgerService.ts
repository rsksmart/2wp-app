import AppBtc from '@ledgerhq/hw-app-btc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import _ from 'lodash';
import WalletService from '@/services/WalletService';
import * as constants from '@/store/constants';
import { WalletAddress } from '@/store/peginTx/types';

export default class LedgerService extends WalletService {
  private btc!: AppBtc;

  constructor(coin: string) {
    super(coin);
    TransportWebUSB
      .create()
      .then((transport) => {
        this.btc = new AppBtc(transport);
      });
  }

  private getAddressesBundle(accountIndex: number, batch: number):
    { derivationPath: string; format: 'legacy' | 'p2sh' | 'bech32' | undefined }[] {
    const bundle: { derivationPath: string; format: 'legacy' | 'p2sh' | 'bech32' | undefined }[] = [];
    for (let index = 0; index < batch; index += 1) {
      let change = true;
      _.range(2).forEach(() => {
        bundle.push({
          derivationPath: this.getDerivationPath(constants
            .BITCOIN_LEGACY_ADDRESS, accountIndex, change, index),
          format: 'legacy',
        });
        bundle.push({
          derivationPath: this.getDerivationPath(constants
            .BITCOIN_SEGWIT_ADDRESS, accountIndex, change, index),
          format: 'p2sh',
        });
        bundle.push({
          derivationPath: this.getDerivationPath(constants
            .BITCOIN_NATIVE_SEGWIT_ADDRESS, accountIndex, change, index),
          format: 'bech32',
        });
        change = !change;
      });
    }
    return bundle;
  }

  public async getAddressList(batch: number):
    Promise<WalletAddress[]> {
    console.log(`requesting ${batch} address`);
    const walletAddresses: WalletAddress[] = [];
    const bundle = this.getAddressesBundle(0, batch);
    try {
      for (let i = 0; i < bundle.length; i += 1) {
        const { derivationPath, format } = bundle[i];
        // eslint-disable-next-line no-await-in-loop
        const walletPublicKey = await this.btc.getWalletPublicKey(derivationPath, { format });
        walletAddresses.push({
          address: walletPublicKey.bitcoinAddress,
          serializedPath: derivationPath,
          path: this.getSerializedPath(derivationPath),
        });
      }
    } catch (e) {
      console.error(e);
    }
    return walletAddresses;
  }
}
