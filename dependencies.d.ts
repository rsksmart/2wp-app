import Transport from '@ledgerhq/hw-transport';

declare module '@ledgerhq/hw-transport-webhid' {
  export default class TransportWebHID extends Transport {
    read(): Promise<Buffer>;

    onInputReport(e: InputReportEvent): void;

    isSupported(): boolean;

    static open(device: string): Promise<TransportWebHID>;
  }
}
