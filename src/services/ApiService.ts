import axios from 'axios';
import { PeginConfiguration, RequestBalance } from '@/types/pegInTx';
import {
  AccountBalance, AddressStatus, FeeAmountDataResponse, NormalizedTx, TxStatus,
} from '@/types';
import { areValidOutputs } from '@/utils';
import { BridgeService } from '@/services/BridgeService';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import { ApiInformation } from '@/types/ApiInformation';

export default class ApiService {
  static baseURL = EnvironmentAccessorService.getEnvironmentVariables().vueAppApiBaseUrl;

  public static getBalances(sessionId: string,
    addressList?: RequestBalance[]): Promise<AccountBalance> {
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
    accountType: string): Promise<FeeAmountDataResponse> {
    return new Promise<FeeAmountDataResponse>((resolve, reject) => {
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
          const expectedChangeAddress = changeAddress || normalizedTx.inputs[0].address;
          const { valid, reason } = areValidOutputs(
            normalizedTx.outputs, powPegAddress,
            amountToTransferInSatoshi.toString(),
            expectedChangeAddress, recipient, refundAddress,
          );
          if (!valid) {
            reject(new Error(reason));
          } else {
            resolve(response.data);
          }
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

  public static getTxStatus(txId: string): Promise<TxStatus> {
    return new Promise<TxStatus>((resolve, reject) => {
      axios.get(`${this.baseURL}/tx-status/${txId}`)
        .then((response) => {
          if (!response.data) {
            return reject(new Error('No data was returned'));
          }
          if (!response.data.type) {
            return reject(new Error('Empty response from server'));
          }
          if (response.data.type === 'INVALID_DATA') {
            return reject(new Error('Invalid data was provided. Check the transaction id and try again'));
          }
          if (response.data.type === 'UNEXPECTED_ERROR') {
            return reject(new Error('There was an unexpected error. Try again later.'));
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

  public static getApiInformation(): Promise<ApiInformation> {
    return new Promise<ApiInformation>((resolve, reject) => {
      axios.get(`${this.baseURL}/api`)
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }
}
