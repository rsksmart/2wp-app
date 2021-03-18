<template>
  <div>
    <template v-if="!ledgerDataReady">
      <connect-device/>
    </template>
    <template v-if="ledgerDataReady">
      <component :is="currentComponent" :balances="balances"
                 @createTx="toConfirmTx" @successConfirmation="toTrackingId"
                 @unused="getUnusedAddresses" :unusedAddresses="unusedAddresses"
                 @txFee="getTxFee" :fees="calculatedFees" :price="bitcoinPrice"
                 :txData="txData" :txId="txId" :showTxId="true"/>
    </template>
    <template v-if="showDialog">
      <btc-to-rbtc-dialog :showDialog="showDialog" @closeDialog="closeDialog"/>
    </template>
  </div>
</template>

<script lang="ts">
import {
  Vue,
  Component, Emit,
} from 'vue-property-decorator';
import BtcToRbtcDialog from '@/components/exchange/BtcToRbtcDialog.vue';
import SendBitcoinForm from '@/components/exchange/SendBitcoinForm.vue';
import ConfirmTransaction from '@/components/ledger/ConfirmTransaction.vue';
import ConnectDevice from '@/components/exchange/ConnectDevice.vue';
import TrackingId from '@/components/exchange/TrackingId.vue';
import { FeeAmountData } from '@/services/types';

@Component({
  components: {
    BtcToRbtcDialog,
    SendBitcoinForm,
    ConfirmTransaction,
    ConnectDevice,
    TrackingId,
  },
})
export default class SendBitcoinLedger extends Vue {
  showDialog = true;

  ledgerDataReady = false;

  txId = '';

  bitcoinPrice = 52179.73; // https://www.coindesk.com/price/bitcoin

  currentComponent = 'SendBitcoinForm';

  unusedAddresses: string[] = [];

  balances = {
    segwit: 50000,
    nativeSegwit: 49997000,
    legacy: 3289478,
  };

  calculatedFees: FeeAmountData = {
    slow: 0,
    average: 0,
    fast: 0,
  };

  amount = 1000000;

  refundAddress = '2N6jtRGNMkdSXnCKk3zG5s33KWhnbfDehkZ';

  recipient = '0x9c4aAE754FF8c963966B26CE8206EF0271c614aa';

  feeBTC = 0.01561;

  change = '2N2U4VZT1pjjXsLq9kgUQwwNNRP5bimtnak';

  get txData() {
    return {
      amount: this.amount,
      refundAddress: this.refundAddress,
      recipient: this.recipient,
      feeBTC: this.feeBTC,
      change: this.change,
    };
  }

  @Emit()
  closeDialog() {
    this.showDialog = false;
    setTimeout(() => {
      this.ledgerDataReady = true;
    }, 2000);
  }

  @Emit()
  toTrackingId(txId: string) {
    this.txId = txId;
    this.currentComponent = 'TrackingId';
  }

  @Emit()
  toConfirmTx({
    amountToTransferInSatoshi, refundAddress, recipient, feeLevel, feeBTC,
  }: {
    amountToTransferInSatoshi: number;
    refundAddress: string;
    recipient: string;
    feeLevel: string;
    feeBTC: number;
  }) {
    console.log(`amountToTransferInSatoshi: ${amountToTransferInSatoshi}`);
    console.log(`refundAddress: ${refundAddress}`);
    console.log(`recipient: ${recipient}`);
    console.log(`feeLevel: ${feeLevel}`);
    console.log(`feeBTC: ${feeBTC}`);
    this.currentComponent = 'ConfirmTransaction';
  }

  @Emit()
  getUnusedAddresses({ flag, accountType }: {flag: boolean; accountType: string}) {
    console.log('getUnusedAddresses', flag, accountType);
    this.unusedAddresses = [
      '2N2U4VZT1pjjXsLq9kgUQwwNNRP5bimtnak',
      '2N6jtRGNMkdSXnCKk3zG5s33KWhnbfDehkZ',
    ];
  }

  @Emit()
  getTxFee({ amount, accountType }: {amount: number; accountType: string}) {
    console.log('getTxFee', amount, accountType);
    this.calculatedFees = {
      slow: 3000,
      average: 6000,
      fast: 9000,
    };
  }
}
</script>
