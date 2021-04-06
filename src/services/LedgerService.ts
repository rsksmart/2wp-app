import AppBtc from '@ledgerhq/hw-app-btc';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
// import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { WalletAddress } from '@/store/peginTx/types';

export default class LedgerService {
  private btc!: AppBtc;

  private coin: string;

  constructor(coin: string) {
    this.coin = coin;
    TransportWebUSB
      .create()
      .then((transport) => {
        this.btc = new AppBtc(transport);
      });
  }

  public getAddressList(): Promise<WalletAddress[]> {
    return new Promise<WalletAddress[]>((resolve, reject) => {
      const responses: { publicKey: string; bitcoinAddress: string; chainCode: string }[] = [];
      this.btc.getWalletPublicKey("44'/1'/0'/0/0")
        .then((res) => {
          responses.push(res);
          return this.btc.getWalletPublicKey("44'/1'/0'/0/1");
        })
        .then((res) => {
          responses.push(res);
        })
        .catch(reject);
    });
  }
}
