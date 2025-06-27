import { ApiService } from '@/common/services';
import { FireblocksTransactionParams, VaultAccount } from '@/common/types';
import axios from 'axios';

export default class FireblocksService {
  private basePath: string;

  private apiKey: string;

  private cert: string;

  private apiUrl: string;

  constructor(apiKey: string, cert: string) {
    this.apiUrl = `${ApiService.baseURL}/fireblocks`;
    this.basePath = 'https://api.fireblocks.io/v1';
    this.apiKey = apiKey;
    this.cert = cert;
  }

  // eslint-disable-next-line class-methods-use-this
  public async getVaultAccounts(): Promise<Array<VaultAccount>> {
    const encodedSecretKey = btoa(this.cert);
    const res = await axios.post(`${ApiService.baseURL}/fireblocks/vaults`, {
      apiKey: this.apiKey,
      cert: encodedSecretKey,
      options: {
        limit: 200,
        orderBy: 'DESC',
      },
    });
    return Promise.resolve(res.data.vaults);
  }

  public async sendTransaction(params: FireblocksTransactionParams) {
    const encodedSecretKey = btoa(this.cert);
    const res = await axios.post(`${this.apiUrl}/transaction`, {
      apiKey: this.apiKey,
      cert: encodedSecretKey,
      payload: params,
    });
    return Promise.resolve(res);
  }
}
