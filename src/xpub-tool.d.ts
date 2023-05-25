import * as bitcoin from 'bitcoinjs-lib';
import { Purpose } from '@/common/types';

declare module '@swan-bitcoin/xpub-lib'{

  interface Metadata {
    type: Purpose,
    index: number,
    depth: number,
    pubkey: string,
    chaincode: string,
    parentFingerprint: string,
    network: string,
    version: xpubObj.version
  }

  function isValidExtPubKey(xpub: string, network: string): boolean;

  function partialKeyDerivationPath({ change, keyIndex }
  :{change: number; keyIndex: number}): string;

  function convertToXPUB(extPubKey: string, network: string): string;

  function fullDerivationPath(
    {
      convertedExtPubKey,
      coinPrefix = COIN_PREFIX,
      purpose,
      network = bitcoin.networks.testnet,
      change = 0,
      keyIndex,
    }: {
      convertedExtPubKey: string;
      coinPrefix: string,
      purpose: Purpose,
      network : string,
      change: number,
      keyIndex: number,
    }
  ): string;
  function getExtPubKeyMetadata(xpub: string): Metadata;

  function accountDerivationPath({
    purpose, accountNumber, network, coinPrefix,
  }:{
    purpose: Purpose;
    accountNumber: number;
    network: string;
    coinPrefix: string;
  }): string;

  export {
    isValidExtPubKey, partialKeyDerivationPath, convertToXPUB,
    fullDerivationPath, getExtPubKeyMetadata, Metadata, accountDerivationPath,
  };
}
