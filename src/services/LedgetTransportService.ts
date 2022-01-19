import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

interface TransportRequest {
  resolve: (value: (PromiseLike<TransportWebUSB> | TransportWebUSB)) => void;
  reject: (reason?: any) => void;
}

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
      console.log('Enqueue transport request ');
      if (this.transportRequestList.length === 0 && !this.isTransportBusy) {
        this.transportRequestList.push({ resolve, reject });
        this.processNext();
      } else {
        this.transportRequestList.push({ resolve, reject });
      }
    });
  }

  public releaseTransport():void {
    this.isTransportBusy = false;
    this.processNext();
  }

  private processNext(): void {
    console.log(`Processing request - RequestList length: ${this.transportRequestList.length}`);
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
    console.log('Transport resolved - waiting for next release');
  }
}
