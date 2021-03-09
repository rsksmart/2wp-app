// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from 'axios';
import { WalletAddress, PeginConfiguration } from '@/store/peginTx/types';
import { AccountBalance, FeeAmountData, NormalizedTx } from '@/services/types';
import * as store from '../store';

export default class ApiService {
  static baseURL = process.env.VUE_APP_API_BASE_URL

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
    return new Promise<NormalizedTx>((resolve, reject) => {
      axios.post(`${this.baseURL}/pegin-tx`, {
        amountToTransferInSatoshi,
        refundAddress,
        recipient: recipient.slice(2),
        sessionId,
        feeLevel,
        changeAddress,
      })
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }
}
