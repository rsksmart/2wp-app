import axios from 'axios';
import { PeginConfiguration, RequestBalance } from '@/common/types/pegInTx';
import {
  AccountBalance,
  AddressStatus,
  FeeAmountDataResponse,
  NormalizedInput,
  NormalizedTx,
  SatoshiBig,
  TxStatus,
  TxStatusType,
  Feature,
  TxInfo,
  LogEntry,
} from '@/common/types';
import { areValidOutputs, isValidInput } from '@/common/utils';
import { BridgeService } from '@/common/services/BridgeService';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { ApiInformation } from '@/common/types/ApiInformation';
import { BlockbookUtxo } from '@/pegin/types/services';
import { AddressInfo } from '@/pegin/types';
import { BigNumber } from 'ethers';

export default class ApiService {
  static get baseURL(): string {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppApiBaseUrl;
  }

  public static getBalances(
    sessionId: string,
    addressList?: RequestBalance[],
  ): Promise<AccountBalance> {
    return new Promise((resolve, reject) => {
      axios.post(`${ApiService.baseURL}/balance`, {
        sessionId,
        addressList,
      })
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  public static getUtxos(addressList: string[]): Promise<BlockbookUtxo[]> {
    return new Promise<BlockbookUtxo[]>((resolve, reject) => {
      if (addressList.length > 0) {
        axios.post(`${ApiService.baseURL}/utxo`, { addressList })
          .then((response) => resolve(response.data.data))
          .catch(reject);
      } else {
        resolve([]);
      }
    });
  }

  public static getPeginConfiguration(): Promise<PeginConfiguration> {
    return new Promise<PeginConfiguration>((resolve, reject) => {
      axios.get(`${ApiService.baseURL}/pegin-configuration`)
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  public static getTxFee(
    sessionId: string,
    amount: number,
    accountType: string,
  ): Promise<FeeAmountDataResponse> {
    return new Promise<FeeAmountDataResponse>((resolve, reject) => {
      axios.post(`${ApiService.baseURL}/tx-fee`, {
        sessionId,
        amount,
        accountType,
      })
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  public static createPeginTx(
    amountToTransferInSatoshi: number,
    refundAddress: string,
    recipient: string,
    sessionId: string,
    feeLevel: string,
    changeAddress: string,
    userAddressList: string[],
    feeAmountCalculated: SatoshiBig,
  )
    : Promise<NormalizedTx> {
    const bridgeService = new BridgeService();
    return new Promise<NormalizedTx>((resolve, reject) => {
      Promise.all([
        axios.post(`${ApiService.baseURL}/pegin-tx`, {
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
            .map((input) => BigNumber.from(input.amount))
            .reduce((prevAmount, currAmount) => prevAmount.add(currAmount));
          const outputsSum = normalizedTx.outputs
            .map((output) => BigNumber.from(output.amount))
            .reduce((prevAmount, currAmount) => prevAmount.add(currAmount));
          const feeToPay = new SatoshiBig(inputsSum.sub(outputsSum).toString(), 'satoshi');
          if (feeToPay.gt(feeAmountCalculated)) {
            reject(new Error('There was an unexpected increase of the calculated fee'));
          }
          const expectedChangeAddress = changeAddress || normalizedTx.inputs[0].address;
          const { valid, reason } = areValidOutputs(
            normalizedTx.outputs,
            powPegAddress,
            amountToTransferInSatoshi.toString(),
            expectedChangeAddress,
            recipient,
            refundAddress,
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
      axios.post(`${ApiService.baseURL}/broadcast`, {
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
      axios.get(`${ApiService.baseURL}/tx?tx=${txId}`)
        .then((response) => {
          if (response.data.error) reject(response.data.error);
          resolve(response.data.hex);
        })
        .catch(reject);
    });
  }

  public static getTxStatus(txId: string, txType?: string): Promise<TxStatus> {
    const url = txType ? `tx-status-by-type/${txId}/${txType}` : `tx-status/${txId}`;
    return new Promise<TxStatus>((resolve, reject) => {
      axios.get(`${ApiService.baseURL}/${url}`)
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
      axios.post(`${ApiService.baseURL}/unusedAddreses`, {
        addressList,
      })
        .then((response) => resolve(response.data.data))
        .catch(reject);
    });
  }

  public static getAddressesInfo(addressList: string[]): Promise<AddressInfo[]> {
    return new Promise<AddressInfo[]>((resolve, reject) => {
      axios.post(`${ApiService.baseURL}/addresses-info`, {
        addressList,
      })
        .then((response) => resolve(response.data.addressesInfo))
        .catch(reject);
    });
  }

  public static getApiInformation(): Promise<ApiInformation> {
    return new Promise<ApiInformation>((resolve, reject) => {
      axios.get(`${ApiService.baseURL}/api`)
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  static estimateFee(blockNumber: number):Promise<SatoshiBig> {
    return new Promise<SatoshiBig>((resolve, reject) => {
      axios.get(`${ApiService.baseURL}/estimate-fee/${blockNumber}`)
        .then((response) => resolve(new SatoshiBig(response.data.amount, 'btc').div(1000))) // Conversion from KB to Bytes
        .catch(reject);
    });
  }

  static registerTx(txInfo: TxInfo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const { txHash, type } = txInfo;
      if (txHash == null || type == null) resolve();
      axios.post(
        `${ApiService.baseURL}/register`,
        txInfo,
        { headers: { 'Content-Type': 'application/json' } },
      )
        .then((response) => resolve(response.data))
        .catch(reject);
    });
  }

  static getFeatures(): Promise<Feature[]> {
    return new Promise<Feature[]>((resolve, reject) => {
      axios.get(`${ApiService.baseURL}/features`)
        .then((response) => resolve(response.data))
        .catch(() => reject(new Error('Unable to get feature flags')));
    });
  }

  static logToServer(entry: LogEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      axios.post(`${ApiService.baseURL}/logs`, entry)
        .then(() => resolve())
        .catch(reject);
    });
  }
}
