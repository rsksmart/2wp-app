import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { WalletAddress } from '@/store/peginTx/types';
import { LedgerjsTransaction } from '@/types';

interface TransportRequest {
  resolve: (value: (PromiseLike<TransportWebUSB> | TransportWebUSB)) => void;
  reject: (reason?: any) => void;
}
type LedgerResponse = string | string[] | Buffer | WalletAddress[] | {
  publicKey: string;
  bitcoinAddress: string;
  chainCode: string;
} | LedgerjsTransaction[] | LedgerjsTransaction;
type LedgerRequest = (transport: TransportWebUSB) => Promise<LedgerResponse>;

export default class LedgerTransportService {
  private static instance: LedgerTransportService;

  private transportRequestList: TransportRequest[];

  private transportWebUsb!: TransportWebUSB;

  private isTransportBusy: boolean;

  private constructor() {
    this.transportRequestList = [];
    this.isTransportBusy = false;
  }

  public static getInstance(): LedgerTransportService {
    if (!LedgerTransportService.instance) {
      LedgerTransportService.instance = new LedgerTransportService();
    }

    return LedgerTransportService.instance;
  }

  getTransport(): Promise<TransportWebUSB> {
    return new Promise<TransportWebUSB>((resolve, reject) => {
      if (this.transportRequestList.length === 0 && !this.isTransportBusy) {
        this.transportRequestList.push({ resolve, reject });
        this.processNext();
      } else {
        this.transportRequestList.push({ resolve, reject });
      }
    });
  }

  public enqueueRequest(request: LedgerRequest): Promise<LedgerResponse> {
    return new Promise<LedgerResponse>((resolve, reject) => {
      this.getTransport()
        .then((transport :TransportWebUSB) => request(transport))
        .then(resolve)
        .catch(reject)
        .finally(() => this.releaseTransport());
    });
  }

  public releaseTransport():void {
    this.isTransportBusy = false;
    this.processNext();
  }

  private processNext(): void {
    if (this.transportRequestList.length === 0) return;
    this.isTransportBusy = true;
    const request = this.transportRequestList.shift();
    if (!this.transportWebUsb) {
      TransportWebUSB.create()
        .then((transport: TransportWebUSB) => {
          this.transportWebUsb = transport;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          request.resolve(this.transportWebUsb);
        })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .catch(request.reject);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      request.resolve(this.transportWebUsb);
    }
  }
}
