/* eslint-disable class-methods-use-this */
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import {
  RecordStore,
  openTransportReplayer,
} from '@ledgerhq/hw-transport-mocker';
import Transport from '@ledgerhq/hw-transport';

interface TransportRequest {
  resolve: (value: (PromiseLike<Transport> | Transport)) => void;
  reject: (reason?: string) => void;
}

type GenericLedgerRequestFn<Type> = (transport: Transport) => Promise<Type>;

export default class MockLedgerTransportService {
  private static instance: MockLedgerTransportService;

  private mockedTransport!: Transport;

  private isTransportBusy: boolean;

  private transportRequestList: TransportRequest[];

  private recordStore: RecordStore = new RecordStore([]);

  constructor() {
    this.isTransportBusy = false;
    this.transportRequestList = [];
    this.mockedTransport = openTransportReplayer(this.recordStore) as unknown as Transport;
  }

  public static getInstance(): MockLedgerTransportService {
    if (!MockLedgerTransportService.instance) {
      MockLedgerTransportService.instance = new MockLedgerTransportService();
    }

    return MockLedgerTransportService.instance;
  }

  public static newInstance() {
    MockLedgerTransportService.instance = new MockLedgerTransportService();
  }

  public isConnected(): boolean {
    return true; // Always return true for testing
  }

  getTransport(): Promise<Transport> {
    // Return a mock TransportWebUSB for testing
    return Promise.resolve(this.mockedTransport);
  }

  public enqueueRequest<Type>(request: GenericLedgerRequestFn<Type>): Promise<Type> {
    return new Promise<Type>((resolve, reject) => {
      this.getTransport()
        .then((transport :Transport) => request(transport))
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
    if (!this.mockedTransport && request) {
      TransportWebUSB.request()
        .then((transport: TransportWebUSB) => {
          this.mockedTransport = transport;
          request.resolve(this.mockedTransport);
        })
        .catch(request.reject);
    } else if (request) {
      request.resolve(this.mockedTransport);
    }
  }
}
