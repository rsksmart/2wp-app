import { AddressType, Purpose } from '@/common/types';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import * as bitcoin from 'bitcoinjs-lib';
import {
  arrayify, computePublicKey, hashMessage, recoverPublicKey,
} from 'ethers/lib/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { BtcAddressType } from '@rsksmart/flyover-sdk';
import { deriveAddress, NETWORKS, bitcoinJsNetwork } from './xPubUtils';

export function getPubKeyFromRskSignedMessage2(signedMessage:string, hashedMessage: string)
  : Buffer {
  const recoveredPk = recoverPublicKey(
    arrayify(hashMessage(arrayify(hashedMessage))),
    signedMessage,
  );
  const newCompressedPK = computePublicKey(recoveredPk, true).substring(2);
  return Buffer.from(newCompressedPK, 'hex');
}

export function getBtcAddressFromSignedMessage(
  signedMessage:string,
  hashedMessage: string,
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
  if (addressRegexp.taproot.test(address)) {
    addressType = constants.BITCOIN_TAPROOT_ADDRESS;
    valid = true;
  }
  return { valid, addressType };
}

function compressPublicKey(pubKey: string) {
  const { publicKey } = bitcoin.ECPair.fromPublicKey(Buffer.from(pubKey, 'hex'));
  return publicKey.toString('hex');
}

export function getP2SHRedeemScript(publicKey: string, network: bitcoin.Network) {
  const pubkey = compressPublicKey(publicKey);
  const pair = bitcoin.ECPair.fromPublicKey(Buffer.from(pubkey, 'hex'));
  const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pair.publicKey, network });
  const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network });
  const redeem = p2sh.redeem?.output;
  return redeem;
}

export function getBtcAddressType(address: string): BtcAddressType {
  const { addressType } = validateAddress(address);
  switch (addressType) {
    case constants.BITCOIN_LEGACY_ADDRESS:
      return 'p2pkh';
    case constants.BITCOIN_SEGWIT_ADDRESS:
      return 'p2sh';
    case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
      return 'p2wpkh';
    case constants.BITCOIN_TAPROOT_ADDRESS:
      return 'p2tr';
    default:
      return 'p2pkh';
  }
}
