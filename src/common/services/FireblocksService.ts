/* eslint-disable class-methods-use-this */
import { ApiService } from '@/common/services';
import {
  ApiUser,
  BtcAccount, FireblocksLocalConfig, FireblocksTransactionParams, VaultAccount, WalletAddress,
} from '@/common/types';
import axios from 'axios';
import * as constants from '@/common/store/constants';

export default class FireblocksService {
  private config: FireblocksLocalConfig;

  private apiUrl: string;

  private vaults: VaultAccount[] = [];

  constructor(config: FireblocksLocalConfig) {
    this.apiUrl = `${ApiService.baseURL}/fireblocks`;
    this.config = config;
  }

  // eslint-disable-next-line class-methods-use-this
  public async getAccountAddresses(): Promise<WalletAddress[]> {
    return new Promise((resolve, reject) => {
      const addresses: WalletAddress[] = [];
      this.getVaultAccounts().then((vaults) => {
        this.vaults = vaults;
        const vault = vaults.find((v) => v.id === this.config.vaultId);
        if (!vault) {
          reject(new Error('Vault not found'));
        }
        addresses.push({
          address: '',
          derivationPath: '',
          arrayPath: [],
          unused: false,
          publicKey: '',
        });
        resolve(addresses);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  name(): Record<'formal_name' | 'short_name' | 'long_name', string> {
    return constants.WALLET_NAMES.FIREBLOCKS;
  }

  availableAccounts(): Array<BtcAccount> {
    return [BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS];
  }

  // eslint-disable-next-line class-methods-use-this
  public async getVaultAccounts(): Promise<Array<VaultAccount>> {
    const encodedSecretKey = btoa(this.config.cert);
    const res = await axios.post(`${ApiService.baseURL}/fireblocks/vaults`, {
      apiKey: this.config.apiKey,
      cert: encodedSecretKey,
      options: {
        limit: 200,
        orderBy: 'DESC',
      },
    });
    return Promise.resolve(res.data.vaults);
  }

  public async sendTransaction(params: FireblocksTransactionParams) {
    const encodedSecretKey = btoa(this.config.cert);
    const res = await axios.post(`${this.apiUrl}/transaction`, {
      apiKey: this.config.apiKey,
      cert: encodedSecretKey,
      payload: params,
    });
    return Promise.resolve(res.data);
  }

  public async getApiUsers(): Promise<Array<ApiUser>> {
    return new Promise((resolve, reject) => {
      const encodedSecretKey = btoa(this.config.cert);
      axios.post(`${this.apiUrl}/api-users`, {
        apiKey: this.config.apiKey,
        cert: encodedSecretKey,
      })
        .then((res) => {
          resolve(res.data.users);
        })
        .catch(reject);
    });
  }
}
