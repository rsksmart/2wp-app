import * as bitcoin from 'bitcoinjs-lib';
import { NETWORKS, deriveChildPublicKey, networkData } from 'unchained-bitcoin';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as xpubLib from '@swan-bitcoin/xpub-lib';
import { Purpose, WalletAddress } from '@/types';
import * as constants from '@/store/constants';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';

function deriveAddress(
  { purpose, pubkey, network }
    : {purpose: Purpose; pubkey: Buffer; network: string},
): string {
  let address: string | undefined = '';
  switch (purpose) {
    case Purpose.P2PKH: {
      const { address: oneAddress } = bitcoin.payments.p2pkh({
        pubkey,
        network: networkData(network),
      });
      address = oneAddress;
      break;
    }
    case Purpose.P2SH: {
      const { address: threeAddress } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey,
          network: networkData(network),
        }),
      });
      address = threeAddress;
      break;
    }
    case Purpose.P2WPKH: {
      const { address: bc1Address } = bitcoin.payments.p2wpkh({
        pubkey,
        network: networkData(network),
      });
      address = bc1Address;
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
  xpub: string, purpose: Purpose, startFrom: number, batchSize: number,
): Array<WalletAddress> => {
  const addresses: Array<WalletAddress> = [];
  console.log(xpubLib.getExtPubKeyMetadata(xpub));
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
