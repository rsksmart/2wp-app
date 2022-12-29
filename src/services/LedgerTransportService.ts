import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

interface TransportRequest {
  resolve: (value: (PromiseLike<TransportWebUSB> | TransportWebUSB)) => void;
  reject: (reason?: any) => void;
}
interface GenericLedgerRequestFn<Type> {
  (transport: TransportWebUSB): Promise<Type>;
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

  public static newInstance() {
    LedgerTransportService.instance = new LedgerTransportService();
  }

  public isConnected():boolean {
    this.isTransportBusy = false;
    let isConnected = false;
    try {
      this.processNext();
      isConnected = true;
    // eslint-disable-next-line no-empty
    } catch (e) { }

    return isConnected;
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

  public enqueueRequest<Type>(request: GenericLedgerRequestFn<Type>): Promise<Type> {
    return new Promise<Type>((resolve, reject) => {
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
    if (!this.transportWebUsb && request) {
      TransportWebUSB.request()
        .then((transport: TransportWebUSB) => {
          this.transportWebUsb = transport;
          request.resolve(this.transportWebUsb);
        })
        .catch(request.reject);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      request.resolve(this.transportWebUsb);
    }
  }
}
