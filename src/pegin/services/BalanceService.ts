import { SatoshiBig, WalletAddress } from '@/common/types';
import { validateAddress } from '@/common/utils';
import * as constants from '@/common/store/constants';
import ApiService from '@/common/services/ApiService';
import { BalanceWithUtxos, BlockbookUtxo } from '../types/services';

function balanceFromUtxosInSatoshis(utxoList: BlockbookUtxo[]) {
  return utxoList.map((utxo) => new SatoshiBig(utxo.value, 'satoshi'))
    .reduce((acc, curr) => acc.plus(curr), new SatoshiBig(0, 'satoshi'));
}

export default class BalanceService {
  public static getBalances(addressList: WalletAddress[]): Promise<BalanceWithUtxos> {
    const addresses: {legacy: string[], segwit: string[], nativeSegwit: string[]} = {
      legacy: [],
      segwit: [],
      nativeSegwit: [],
    };

    return new Promise((resolve, reject) => {
      addressList.forEach(({ address }) => {
        const { addressType } = validateAddress(address);
        switch (addressType) {
          case constants.BITCOIN_LEGACY_ADDRESS:
            addresses.legacy.push(address);
            break;
          case constants.BITCOIN_SEGWIT_ADDRESS:
            addresses.segwit.push(address);
            break;
          case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
            addresses.nativeSegwit.push(address);
            break;
          default:
            reject(new Error('Invalid address type'));
        }
      });

      Promise.all([
        ApiService.getUtxos(addresses.legacy),
        ApiService.getUtxos(addresses.segwit),
        ApiService.getUtxos(addresses.nativeSegwit)])
        .then(([legacyUtxos, segwitUtxos, nativeSegwitUtxos]) => {
          resolve({
            legacy: { balance: balanceFromUtxosInSatoshis(legacyUtxos), utxos: legacyUtxos },
            segwit: { balance: balanceFromUtxosInSatoshis(segwitUtxos), utxos: segwitUtxos },
            nativeSegwit: {
              balance: balanceFromUtxosInSatoshis(nativeSegwitUtxos),
              utxos: nativeSegwitUtxos,
            },
          });
        }).catch(reject);
    });
  }
}