import { SatoshiBig, Utxo } from '../types';

export function getBalanceFromUtxoList(utxoList: Array<Utxo>): SatoshiBig {
  const filteredList = utxoList.filter((utxo) => utxo.selected);
  const balance = filteredList.reduce((acc, utxo) => acc + Number(utxo.amount), 0);
  return new SatoshiBig(balance, 'satoshi');
}
