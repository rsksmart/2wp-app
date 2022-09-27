import {
  LiqualityAddress,
  LiqualityRequestArgs,
  LiqualityResponse,
  WindowBitcoinProvider,
} from '@/types';

export default class MockedBtcProvider implements WindowBitcoinProvider {
  // eslint-disable-next-line class-methods-use-this
  public enable(): Promise<Array<LiqualityAddress>> {
    return Promise.resolve([]);
  }

  // eslint-disable-next-line class-methods-use-this
  public checkApp(): Promise<void> {
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  public request(args:LiqualityRequestArgs): Promise<LiqualityResponse> {
    return Promise.resolve([]);
  }
}
