import { Purpose } from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import * as bitcoin from 'bitcoinjs-lib';
import {
  arrayify, computePublicKey, hashMessage, recoverPublicKey,
} from 'ethers/lib/utils';
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
