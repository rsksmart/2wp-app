import { ecrecover } from 'ethereumjs-util';
import { Purpose } from '@/types';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import * as constants from '@/store/constants';
import * as bitcoin from 'bitcoinjs-lib';
import { deriveAddress, NETWORKS, bitcoinJsNetwork } from './xPubUtils';

export function getPubKeyFromRskSignedMessage(signedMessage:string, hashedMessage: string): Buffer {
  const r = Buffer.from(signedMessage.substr(0, 66));
  const s = Buffer.from(`0x${signedMessage.substr(66, 64)}`);
  const v = `0x${signedMessage.substr(130, 2)}`;
  const messageBuffer = Buffer.from(hashedMessage.substr(2), 'hex');
  return Buffer.from(`04${ecrecover(messageBuffer, v, r, s).toString('hex')}`, 'hex');
}

export function getBtcAddressFromSignedMessage(
  signedMessage:string, hashedMessage: string,
): string {
  const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
  === constants.BTC_NETWORK_MAINNET ? NETWORKS.MAINNET : NETWORKS.TESTNET;
  const publicKey: Buffer = getPubKeyFromRskSignedMessage(signedMessage, hashedMessage);
  const pubEcpair = bitcoin.ECPair.fromPublicKey(publicKey, { network: bitcoinJsNetwork(network) });
  return deriveAddress({
    purpose: Purpose.P2WPKH,
    pubkey: pubEcpair.publicKey,
    network,
  });
}
