// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from 'axios';
import { WalletAddress } from '@/store/peginTx/types';

export default class ApiService {
  static baseURL = process.env.VUE_APP_API_BASE_URL

  public static getBalances(sessionId: string, addressList?: WalletAddress[]): Promise<object> {
    return new Promise((resolve, reject) => {
      axios.post(`${this.baseURL}/balance`, {
        sessionId,
        addressList,
      })
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  public static getPeginConfiguration(): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      axios.get(`${this.baseURL}/pegin-configuration`)
        .then((response) => resolve(response.data));
    });
  }
}
