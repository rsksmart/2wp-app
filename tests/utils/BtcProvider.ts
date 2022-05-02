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
  public request(args:LiqualityRequestArgs): Promise<LiqualityResponse> {
    return Promise.resolve([]);
  }
}
