import axios from 'axios';
import { WalletAddress, PeginConfiguration } from '@/types/pegInTx';
import {
  AccountBalance, AddressStatus, FeeAmountData, NormalizedTx,
} from '@/types';
import { PeginStatus } from '@/types/store';
import { isValidOpReturn, isValidPowPegAddress } from '@/utils';
import { BridgeService } from '@/services/BridgeService';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

export default class ApiService {
  static baseURL = EnvironmentAccessorService.getEnvironmentVariables().vueAppApiBaseUrl;

  public static getBalances(sessionId: string,
    addressList?: WalletAddress[]): Promise<AccountBalance> {
    return new Promise((resolve, reject) => {
      axios.post(`${this.baseURL}/balance`, {
        sessionId,
        addressList,
      })
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  public static getPeginConfiguration(): Promise<PeginConfiguration> {
    return new Promise<PeginConfiguration>((resolve, reject) => {
      axios.get(`${this.baseURL}/pegin-configuration`)
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  public static getTxFee(sessionId: string, amount: number,
    accountType: string): Promise<FeeAmountData> {
    return new Promise<FeeAmountData>((resolve, reject) => {
      axios.post(`${this.baseURL}/tx-fee`, {
        sessionId,
        amount,
        accountType,
      })
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  public static createPeginTx(amountToTransferInSatoshi: number, refundAddress: string,
    recipient: string, sessionId: string, feeLevel: string,
    changeAddress: string): Promise<NormalizedTx> {
    const bridgeService = new BridgeService();
    return new Promise<NormalizedTx>((resolve, reject) => {
      Promise.all([
        axios.post(`${this.baseURL}/pegin-tx`, {
          amountToTransferInSatoshi,
          refundAddress,
          recipient: recipient.slice(2),
          sessionId,
          feeLevel,
          changeAddress,
        }),
        bridgeService.getFederationAddress(),
      ])
        .then(([response, powPegAddress]) => {
          const normalizedTx: NormalizedTx = response.data;
          if (isValidOpReturn(normalizedTx.outputs, recipient, refundAddress)) {
            if (isValidPowPegAddress(normalizedTx.outputs, powPegAddress)) {
              resolve(response.data);
            } else {
              reject(new Error('Invalid data when comparing Powpeg Address'));
            }
          }
          reject(new Error('Invalid data when parsing OpReturn'));
        })
        .catch(reject);
    });
  }

  public static broadcast(signedRawTx: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      axios.post(`${this.baseURL}/broadcast`, {
        data: signedRawTx,
      })
        .then((response) => {
          if (response.data.error) reject(response.data.error);
          resolve(response.data.txId);
        })
        .catch(reject);
    });
  }

  public static getTxHex(txId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      axios.get(`${this.baseURL}/tx?tx=${txId}`)
        .then((response) => {
          if (response.data.error) reject(response.data.error);
          resolve(response.data.hex);
        })
        .catch(reject);
    });
  }

  public static getPegInStatus(txId: string): Promise<PeginStatus> {
    return new Promise<PeginStatus>((resolve, reject) => {
      axios.get(`${this.baseURL}/pegin-status?txId=${txId}`)
        .then((response) => {
          if (!response.data) {
            return reject(new Error('No data was returned'));
          }
          if (response.data.error) {
            return reject(response.data.error);
          }
          if (!response.data.status) {
            return reject(new Error('Empty response from server'));
          }
          return resolve(response.data);
        })
        .catch(reject);
    });
  }

  public static areUnusedAddresses(addressList: string[]): Promise<AddressStatus[]> {
    return new Promise<AddressStatus[]>((resolve, reject) => {
      axios.post(`${this.baseURL}/unusedAddreses`, {
        addressList,
      })
        .then((response) => resolve(response.data.data))
        .catch(reject);
    });
  }
}
