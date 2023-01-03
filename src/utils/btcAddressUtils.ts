import { ecdsaRecover } from 'secp256k1';
import { Purpose } from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import * as bitcoin from 'bitcoinjs-lib';
import { deriveAddress, NETWORKS, bitcoinJsNetwork } from './xPubUtils';

export function getPubKeyFromRskSignedMessage(signedMessage:string, hashedMessage: string): Buffer {
  const hashedMessageBuffer = Buffer.from(hashedMessage.substr(2), 'hex');
  const messageBuffer = Buffer.from(signedMessage.substr(2, 128), 'hex');
  const recId = 0;
  return Buffer.from(ecdsaRecover(messageBuffer, recId, hashedMessageBuffer, false));
}

export function getBtcAddressFromSignedMessage(
  signedMessage:string, hashedMessage: string,
): string {
  const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
  === constants.BTC_NETWORK_MAINNET ? NETWORKS.MAINNET : NETWORKS.TESTNET;
  const publicKey: Buffer = getPubKeyFromRskSignedMessage(signedMessage, hashedMessage);
  const pubEcpair = bitcoin.ECPair.fromPublicKey(publicKey, { network: bitcoinJsNetwork(network) });
  return deriveAddress({
    purpose: Purpose.P2PKH,
    pubkey: pubEcpair.publicKey,
    network,
  });
}
