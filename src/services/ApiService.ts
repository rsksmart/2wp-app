import axios from 'axios';
import { WalletAddress, PeginConfiguration } from '@/store/peginTx/types';
import { AccountBalance, FeeAmountData, NormalizedTx } from '@/types';
import { PeginStatus } from '@/store/types';
import { isValidOpReturn } from './OpReturnUtils';
import { isValidPowPegAddress } from './PowPegAddressUtils';
import { BridgeService } from '@/services/BridgeService';

export default class ApiService {
  static baseURL = process.env.VUE_APP_API_BASE_URL;

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
          if (response.data.error) reject(response.data.error);
          resolve(response.data);
        })
        .catch(reject);
    });
  }
}
