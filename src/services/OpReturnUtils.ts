/* eslint-disable */
import {address, networks} from 'bitcoinjs-lib';
import { NormalizedOutput } from '@/types';
import * as constants from '@/store/constants';

function getNetType(type: string): number {
  if (process.env.VUE_APP_COIN === constants.BTC_NETWORK_MAINNET) {
    if (type === 'P2PKH') {
      return networks.bitcoin.pubKeyHash;
    }
    if (type === 'P2SH') {
      return networks.bitcoin.scriptHash;
    }
  }
  if (process.env.VUE_APP_COIN === constants.BTC_NETWORK_TESTNET) {
    if (type === 'P2PKH') {
      return networks.testnet.pubKeyHash;
    }
    if (type === 'P2SH') {
      return networks.testnet.scriptHash;
    }
  }
  throw new Error(`Invalid type of network ${type}`);
}

function getAddress(data: string, typeAddress: string): string {
  if (data.length !== 40) {
    return '';
  }
  try {
    return address.toBase58Check(Buffer.from(`${data}`, 'hex'), getNetType(typeAddress));
  } catch (error) {
    throw new Error(`Can not obtain address from data ${data} with error ${error}`)
  }
}

function getRefundAddress(addressRefundInfo: string): string {
  let addressRefundData;
  let addressRefundType;
  let address = '';
  try {
    addressRefundType = Number(addressRefundInfo.substring(0, 2));
    addressRefundData = addressRefundInfo.substring(2, 42);
    if (addressRefundType === 1) { // P2PKH_ADDRESS_TYPE
      address = getAddress(addressRefundData, 'P2PKH');
    } else if (addressRefundType === 2) { // P2SH_ADDRESS_TYPE
      address = getAddress(addressRefundData, 'P2SH');
    } else {
      throw new Error(`Wrong refund address type. Current type: ${addressRefundType}`);
    }
  }
  catch (error) {
    throw new Error(`Wrong refund address type. Data: ${addressRefundInfo} with error ${error}`);  
  }
  return address;
}

export function isValidOpReturn(outputs: NormalizedOutput[], destinationRskAddress: string, refundBtcAddress: string): boolean {
  let destinationRskAddressFound = '';
  let refundBtcAddressFound = '';

  for (let i = 0; outputs && i < outputs.length; i++) {
    const output: NormalizedOutput = outputs[i];
    if (output.op_return_data 
      && output.op_return_data.length === 92 
      && output.op_return_data.substr(0, 10).startsWith('52534b5401')
    ) { // Includes version 01 in the same if
      const opReturnDestAddress = output.op_return_data.substring(10, 50);
      destinationRskAddressFound = opReturnDestAddress.startsWith('0x') ? opReturnDestAddress : `0x${opReturnDestAddress}`;
      if (destinationRskAddress === destinationRskAddressFound) { 
        try{
          refundBtcAddressFound = getRefundAddress(output.op_return_data.substring(50, 92));
          return (refundBtcAddress === refundBtcAddressFound);
        } catch {
          return false;
        } 
      }
    }
  }
  return false;
}
