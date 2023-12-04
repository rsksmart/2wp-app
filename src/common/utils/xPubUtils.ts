import * as bitcoin from 'bitcoinjs-lib';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as xpubLib from '@swan-bitcoin/xpub-lib';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import { Purpose, WalletAddress } from '@/common/types';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

const bip32 = BIP32Factory(ecc);

export enum NETWORKS {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export function bitcoinJsNetwork(network: NETWORKS): bitcoin.networks.Network {
  return network === NETWORKS.MAINNET
    ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
}

export function deriveAddress(
  { purpose, pubkey, network }
    : {purpose: Purpose; pubkey: Buffer; network: NETWORKS},
): string {
  let address: string | undefined = '';
  switch (purpose) {
    case Purpose.P2PKH: {
      const { address: legacyAddress } = bitcoin.payments.p2pkh({
        pubkey,
        network: bitcoinJsNetwork(network),
      });
      address = legacyAddress;
      break;
    }
    case Purpose.P2SH: {
      const { address: segwitAddress } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey,
          network: bitcoinJsNetwork(network),
        }),
      });
      address = segwitAddress;
      break;
    }
    case Purpose.P2WPKH: {
      const { address: bech32Address } = bitcoin.payments.p2wpkh({
        pubkey,
        network: bitcoinJsNetwork(network),
      });
      address = bech32Address;
      break;
    }
    default:
      address = '';
  }
  if (address) {
    return address;
  }
  return '';
}

function getAccountFromExtPubKey(extPubKey: string) {
  const rawAccountNumber = xpubLib.getExtPubKeyMetadata(extPubKey).index;
  if (rawAccountNumber > 2147483647) {
    return rawAccountNumber - 2147483648;
  }
  return rawAccountNumber;
}

export function toHexString(byteArray: Buffer) {
  // eslint-disable-next-line no-bitwise
  return Array.prototype.map.call(byteArray, (byte) => (`0${(byte & 0xFF).toString(16)}`).slice(-2)).join('');
}

function deriveChildPublicKey(extendedPublicKey: string, bip32Path: string, network: NETWORKS)
  : string {
  if (bip32Path.slice(0, 2) === 'm/') {
    return deriveChildPublicKey(extendedPublicKey, bip32Path.slice(2), network);
  }
  const node = bip32.fromBase58(extendedPublicKey, bitcoinJsNetwork(network));
  const child = node.derivePath(bip32Path);
  return toHexString(child.publicKey);
}

function addressFromExtPubKey({
  extPubKey,
  change = false,
  keyIndex,
  purpose = Purpose.P2WPKH,
}:
  {
    extPubKey: string;
    change: boolean,
    keyIndex: number,
    purpose: Purpose,
  })
  : WalletAddress | undefined {
  const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
  === constants.BTC_NETWORK_MAINNET ? NETWORKS.MAINNET : NETWORKS.TESTNET;
  if (!xpubLib.isValidExtPubKey(extPubKey, network)) {
    return undefined;
  }
  const changeNumber = change ? 1 : 0;
  const partialPath = `m/${changeNumber}/${keyIndex}`;
  const convertedExtPubKey = xpubLib.convertToXPUB(extPubKey, network);
  const fullPath = [
    xpubLib.accountDerivationPath({
      purpose,
      accountNumber: getAccountFromExtPubKey(extPubKey),
      network,
      coinPrefix: 'm',
    }),
    changeNumber,
    keyIndex,
  ].join('/');
  const childPubKey = deriveChildPublicKey(
    convertedExtPubKey,
    partialPath,
    network,
  );
  const keyPair = bitcoin.ECPair.fromPublicKey(Buffer.from(childPubKey, 'hex'));
  const pubkey = keyPair.publicKey;
  return {
    derivationPath: fullPath,
    address: deriveAddress({ purpose, pubkey, network }),
    publicKey: pubkey.toString('hex'),
  };
}

export const deriveBatchAddresses = (
  xpub: string,
  purpose: Purpose,
  startFrom: number,
  batchSize: number,
): Array<WalletAddress> => {
  const addresses: Array<WalletAddress> = [];
  for (let keyIndex = startFrom; keyIndex < startFrom + batchSize; keyIndex += 1) {
    const derivedAddress = addressFromExtPubKey({
      extPubKey: xpub,
      change: false,
      keyIndex,
      purpose,
    });
    const derivedChangeAddress = addressFromExtPubKey({
      extPubKey: xpub,
      change: true,
      keyIndex,
      purpose,
    });
    if (derivedAddress && derivedChangeAddress) {
      addresses.push(derivedAddress);
      addresses.push(derivedChangeAddress);
    }
  }

  return addresses;
};
