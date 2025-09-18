/* eslint-disable class-methods-use-this */
import { ApiService } from '@/common/services';
import {
  ApiUsersResponse,
  BtcAccount, FireblocksLocalConfig,
  FireblocksResponse, FireblocksTransactionParams,
  VaultAccount, WalletAddress,
} from '@/common/types';
import axios from 'axios';
import * as constants from '@/common/store/constants';
import { buildJWT } from '../utils';

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
    const uri = '/v1/vault/accounts_paged';
    const body = {
      limit: 200,
      orderBy: 'DESC',
    };
    const jwt = await buildJWT({
      pemKey: this.config.cert,
      apiKey: this.config.apiKey,
      uri,
      body: JSON.stringify(body),
    });
    const res = await axios.post(`${ApiService.baseURL}/fireblocks/generic-get`, {
      apiKey: this.config.apiKey,
      jwt,
      uri,
      bodyData: body,
    });
    return Promise.resolve(res.data.data.accounts);
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

  public async getApiUsers(): Promise<FireblocksResponse<ApiUsersResponse>> {
    return new Promise((resolve, reject) => {
      const uri = '/v1/management/api_users';
      const body = {
        limit: 200,
        orderBy: 'DESC',
      };
      buildJWT({
        pemKey: this.config.cert,
        apiKey: this.config.apiKey,
        uri,
        body: JSON.stringify(body),
      }).then((jwt) => axios.post(`${this.apiUrl}/generic-get`, {
        apiKey: this.config.apiKey,
        jwt,
        uri,
        bodyData: body,
      }))
        .then((res) => {
          resolve(res.data);
        })
        .catch(reject);
    });
  }
}
