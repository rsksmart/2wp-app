import { address, networks } from 'bitcoinjs-lib';
import { NormalizedOutput } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

function getAddressType(type: string, network: networks.Network): number {
  switch (type) {
    case 'P2PKH':
      return network.pubKeyHash;
    case 'P2SH':
      return network.scriptHash;
    default:
      throw new Error(`Invalid type of address ${type}`);
  }
}

function getNetType(type: string): number {
  switch (EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin) {
    case constants.BTC_NETWORK_TESTNET:
      return getAddressType(type, networks.testnet);
    case constants.BTC_NETWORK_MAINNET:
      return getAddressType(type, networks.bitcoin);
    default:
      throw new Error(`Invalid network ${EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin}`);
  }
}

function getAddress(data: string, typeAddress: string): string {
  if (data.length !== 40) {
    return '';
  }
  try {
    return address.toBase58Check(Buffer.from(`${data}`, 'hex'), getNetType(typeAddress));
  } catch (error) {
    throw new Error(`Can not obtain address from data ${data} with error ${error}`);
  }
}

function getRefundAddress(addressRefundInfo: string): string {
  let addressRefundData;
  let addressRefundType;
  let refundAddress = '';
  try {
    addressRefundType = Number(addressRefundInfo.substring(0, 2));
    addressRefundData = addressRefundInfo.substring(2, 42);
    if (addressRefundType === 1) { // P2PKH_ADDRESS_TYPE
      refundAddress = getAddress(addressRefundData, 'P2PKH');
    } else if (addressRefundType === 2) { // P2SH_ADDRESS_TYPE
      refundAddress = getAddress(addressRefundData, 'P2SH');
    } else {
      throw new Error(`Wrong refund address type. Current type: ${addressRefundType}`);
    }
  } catch (error) {
    throw new Error(`Wrong refund address type. Data: ${addressRefundInfo} with error ${error}`);
  }
  return refundAddress;
}

export function isValidOpReturn(
  outputs: NormalizedOutput[],
  destinationRskAddress: string,
  refundBtcAddress: string,
): boolean {
  let validOpReturnOutputs = 0;
  let opReturnOutputsCount = 0;
  for (let i = 0; outputs && i < outputs.length; i += 1) {
    const output: NormalizedOutput = outputs[i];
    if (output.op_return_data) {
      opReturnOutputsCount += 1;
    }
    if (output.op_return_data
      && (output.op_return_data.length === 50 || output.op_return_data.length === 92)
      && output.op_return_data.substr(0, 10).startsWith('52534b5401')
      && output.amount === '0'
    ) { // Includes version 01 in the same if
      const opReturnDestAddress = output.op_return_data.substring(10, 50);
      const destinationRskAddressFound = opReturnDestAddress.startsWith('0x') ? opReturnDestAddress : `0x${opReturnDestAddress}`;
      if (destinationRskAddress === destinationRskAddressFound) {
        try {
          if (!refundBtcAddress && output.op_return_data.length === 50) {
            validOpReturnOutputs += 1;
          } else {
            const refundBtcAddressFound = getRefundAddress(output.op_return_data.substring(50, 92));
            if (refundBtcAddress === refundBtcAddressFound) {
              validOpReturnOutputs += 1;
            }
          }
        } catch {
          return false;
        }
      }
    }
  }
  return validOpReturnOutputs === 1 && opReturnOutputsCount === 1;
}
