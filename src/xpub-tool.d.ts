import * as bitcoin from 'bitcoinjs-lib';
import { Purpose } from '@/types';

declare module '@swan-bitcoin/xpub-lib'{

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
  function getAccountFromExtPubKey(xpub: string): number;
  export {
    isValidExtPubKey, partialKeyDerivationPath, convertToXPUB,
    fullDerivationPath, getAccountFromExtPubKey,
  };
}
