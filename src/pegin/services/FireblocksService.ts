import { VaultAccount } from '@/common/types';
import axios from 'axios';

export default class FireblocksService {
  private basePath: string;

  private apiKey: string;

  private cert: string;

  constructor(apiKey: string, cert: string) {
    this.basePath = 'https://api.fireblocks.io/v1';
    this.apiKey = apiKey;
    this.cert = cert;
  }

  // eslint-disable-next-line class-methods-use-this
  public async getVaultAccounts(): Promise<Array<VaultAccount>> {
    console.log('attempting to request something');
    const encodedSecretKey = btoa(this.cert);
    const res = await axios.post('http://localhost:3000/fireblocks/vaults', {
      apiKey: this.apiKey,
      cert: encodedSecretKey,
      options: {
        limit: 200,
        orderBy: 'DESC',
      },
    });
    return Promise.resolve(res.data.vaults);
  }
}
