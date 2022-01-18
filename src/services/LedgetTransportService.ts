import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

interface TransportRequest {
  resolve: (value: (PromiseLike<TransportWebUSB> | TransportWebUSB)) => void;
  reject: (reason?: any) => void;
}

export default class LedgerTransportService {
  private static instance: LedgerTransportService;

  private transportRequestList: TransportRequest[];

  private transportWebUsb: TransportWebUSB | undefined;

  private constructor() {
    this.transportRequestList = [];
  }

  public static getInstance(): LedgerTransportService {
    if (!LedgerTransportService.instance) {
      LedgerTransportService.instance = new LedgerTransportService();
    }

    return LedgerTransportService.instance;
  }

  getTransport(): Promise<TransportWebUSB> {
    return new Promise<TransportWebUSB>((resolve, reject) => {
      if (this.transportRequestList.length) {
        TransportWebUSB.create()
          .then((transport: TransportWebUSB) => {
            this.transportWebUsb = transport;
            resolve(this.transportWebUsb);
          })
          .catch(reject);
      } else {
        this.transportRequestList.push({
          resolve,
          reject,
        });
      }
    });
  }

  public processNext(): Promise<void> {
    return new Promise<void>((resolve) => {
      // TODO: ask if the transport is available
      if (this.transportRequestList.length > 0) {
        const request = this.transportRequestList.shift();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        request.resolve(this.transportWebUsb);
        resolve();
      } else if (this.transportWebUsb) {
        resolve(this.transportWebUsb.close());
      }
      resolve();
    });
  }
}
