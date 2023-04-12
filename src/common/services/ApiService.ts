import axios from 'axios';
import { PeginConfiguration, RequestBalance } from '@/common/types/pegInTx';
import {
  AccountBalance,
  AddressStatus,
  FeeAmountDataResponse,
  NormalizedInput,
  NormalizedTx,
  SatoshiBig,
  TxStatus, TxStatusType,
} from '@/common/types';
import { areValidOutputs, isValidInput } from '@/common/utils';
import { BridgeService } from '@/common/services/BridgeService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { ApiInformation } from '@/common/types/ApiInformation';

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
    changeAddress: string, userAddressList: string[], feeAmountCalculated: SatoshiBig)
    : Promise<NormalizedTx> {
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
          if (!normalizedTx.inputs
            .every((input: NormalizedInput) => isValidInput(input, userAddressList))) {
            reject(new Error('Invalid input list on the created Transaction'));
          }
          const inputsSum = normalizedTx.inputs
            .map((input) => Number(input.amount))
            .reduce((prevAmount, currAmount) => prevAmount + currAmount);
          const outputsSum = normalizedTx.outputs
            .map((output) => Number(output.amount))
            .reduce((prevAmount, currAmount) => prevAmount + currAmount);
          const feeToPay = new SatoshiBig(inputsSum - outputsSum, 'satoshi');
          if (feeToPay.gt(feeAmountCalculated)) {
            reject(new Error('There was an unexpected increase of the calculated fee'));
          }
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
          if (response.data.type === TxStatusType.UNEXPECTED_ERROR) {
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