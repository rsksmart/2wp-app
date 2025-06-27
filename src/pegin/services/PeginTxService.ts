import * as bitcoin from 'bitcoinjs-lib';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import {
  NormalizedOutput, NormalizedTx, SatoshiBig, Utxo,
} from '@/common/types';
import { remove0x, validateAddress } from '@/common/utils';
import * as constants from '@/common/store/constants';
import { BigNumber } from 'ethers';

export default class PeginTxService {
  private static getRskOutput(recipientAddress: string, refundAddress: string): NormalizedOutput {
    const output: NormalizedOutput = {
      amount: '0',
      op_return_data: `${constants.POWPEG_RSKT_HEADER + remove0x(recipientAddress)}`,
    };
    if (refundAddress) {
      const { addressType: refundAddressType } = validateAddress(refundAddress);
      const hash = bitcoin.address.fromBase58Check(refundAddress).hash.toString('hex');
      switch (refundAddressType) {
        case constants.BITCOIN_LEGACY_ADDRESS:
          output.op_return_data += `01${hash}`;
          break;
        case constants.BITCOIN_SEGWIT_ADDRESS:
          output.op_return_data += `02${hash}`;
          break;
        default:
          throw new Error(`Invalid refund address ${refundAddress}}`);
      }
    }
    return output;
  }

  public static buildNormalizedTx({
    selectedUtxoList,
    totalFee,
    amountToTransfer,
    federationOrLPAddress,
    refundAddress,
    rskRecipientAddress,
    changeAddress,
    peginType,
  }: {
    selectedUtxoList: Utxo[];
    totalFee: SatoshiBig;
    amountToTransfer: SatoshiBig;
    federationOrLPAddress: string;
    refundAddress: string;
    rskRecipientAddress: string;
    changeAddress: string;
    peginType: constants.peginType;
  }): NormalizedTx {
    const normalizedTx: NormalizedTx = {
      coin: EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin,
      inputs: [],
      outputs: [],
    };
    normalizedTx.inputs = selectedUtxoList.map((utxo) => ({
      address: utxo.address ?? '',
      prev_hash: utxo.txid,
      amount: utxo.amount.toString(),
      prev_index: utxo.vout,
    }));
    const federationOrLPOutput: NormalizedOutput = {
      address: federationOrLPAddress,
      amount: amountToTransfer.toSatoshiString(),
    };
    if (peginType === constants.peginType.POWPEG) {
      normalizedTx.outputs.push(this.getRskOutput(rskRecipientAddress, refundAddress));
    }
    normalizedTx.outputs.push(federationOrLPOutput);
    const totalBalance = selectedUtxoList.reduce((acc, { amount }) => acc + amount, 0);
    const totalBalanceInSatoshis = new SatoshiBig(totalBalance, 'satoshi');
    const changeOutput: NormalizedOutput = {
      address: changeAddress === '' ? normalizedTx.inputs[0].address : changeAddress,
      amount: totalBalanceInSatoshis.minus(amountToTransfer).minus(totalFee).toSatoshiString(),
    };
    const burnDustValue = Math.min(
      EnvironmentAccessorService.getEnvironmentVariables().burnDustValue,
      constants.BURN_DUST_MAX_VALUE,
    );
    if (BigNumber.from(changeOutput.amount).toNumber() > burnDustValue) {
      normalizedTx.outputs.push(changeOutput);
    }
    return normalizedTx;
  }
}
