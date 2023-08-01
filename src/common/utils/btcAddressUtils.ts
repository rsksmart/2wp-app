import { AddressType, Purpose } from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import * as bitcoin from 'bitcoinjs-lib';
import {
  arrayify, computePublicKey, hashMessage, recoverPublicKey,
} from 'ethers/lib/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { deriveAddress, NETWORKS, bitcoinJsNetwork } from './xPubUtils';

export function getPubKeyFromRskSignedMessage2(signedMessage:string, hashedMessage: string)
  : Buffer {
  const recoveredPk = recoverPublicKey(
    arrayify(hashMessage(arrayify(hashedMessage))), signedMessage,
  );
  const newCompressedPK = computePublicKey(recoveredPk, true).substring(2);
  return Buffer.from(newCompressedPK, 'hex');
}

export function getBtcAddressFromSignedMessage(
  signedMessage:string, hashedMessage: string,
): string {
  const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
  === constants.BTC_NETWORK_MAINNET ? NETWORKS.MAINNET : NETWORKS.TESTNET;
  const publicKey: Buffer = getPubKeyFromRskSignedMessage2(signedMessage, hashedMessage);
  const pubEcpair = bitcoin.ECPair.fromPublicKey(publicKey, { network: bitcoinJsNetwork(network) });
  return deriveAddress({
    purpose: Purpose.P2PKH,
    pubkey: pubEcpair.publicKey,
    network,
  });
}

export function validateAddress(address: string): {valid: boolean; addressType: AddressType} {
  const addressRegexp = EnvironmentContextProviderService
    .getEnvironmentContext().getAddressRegexPattern();
  let addressType: AddressType = constants.BITCOIN_UNKNOWN_ADDRESS_TYPE;
  let valid = false;
  if (addressRegexp.legacy.test(address)) {
    addressType = constants.BITCOIN_LEGACY_ADDRESS;
    valid = true;
  }
  if (addressRegexp.segwit.test(address)) {
    addressType = constants.BITCOIN_SEGWIT_ADDRESS;
    valid = true;
  }
  if (addressRegexp.nativeSegwit.test(address)) {
    addressType = constants.BITCOIN_NATIVE_SEGWIT_ADDRESS;
    valid = true;
  }
  return { valid, addressType };
}
