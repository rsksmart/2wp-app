<template>
  <v-container class="px-0">
    <v-row class="mb-16">
      <status-progress-bar :isFlyover="isFlyover" :txNotFound="txNotFound"
                           :txWithError="txWithError" :details="summary" />
    </v-row>
    <v-row class="mt-16">
      <status-summary :details="summary" :type="typeSummary"
                    :txWithError="txWithError" />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  PeginStatus,
  SatoshiBig,
  TxStatusType,
  NormalizedSummary,
  FlyoverStatusModel,
  TxStatus,
} from '@/common/types';
import { toSatoshiBigIntString } from '@/common/utils';
import { useStateAttribute } from '@/common/store/helper';
import StatusProgressBar from '@/common/components/status/StatusProgressBar.vue';
import StatusSummary from '@/common/components/status/StatusSummary.vue';

export default defineComponent({
  name: 'TxPegin',
  components: {
    StatusSummary,
    StatusProgressBar,
  },
  props: {
    txId: String,
    isFlyover: Boolean,
    txNotFound: Boolean,
    txWithError: Boolean,
  },
  setup(props) {
    const typeSummary = props.isFlyover ? TxStatusType.FLYOVER_PEGIN : TxStatusType.PEGIN;

    const txDetails = useStateAttribute<PeginStatus | FlyoverStatusModel>('status', 'txDetails');
    const flyoverStatus = useStateAttribute<TxStatus['flyoverStatus']>('status', 'flyoverStatus');

    const txPeginSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as PeginStatus;
      const total = new SatoshiBig(status.btc.amountTransferred, 'btc')
        .safeMinus(new SatoshiBig(status.btc.fees, 'btc'));
      return {
        amountFromString: status.btc.amountTransferred.toString(),
        amountReceivedString: total.toBTCTrimmedString(),
        fee: status.btc.fees,
        recipientAddress: status.rsk.recipientAddress,
        btcTxId: status.btc.txId,
        refundAddress: status.btc.refundAddress,
        federationAddress: status.btc.federationAddress,
        total: status.btc.amountTransferred.toString(),
        senderAddress: status.btc.senderAddress,
        status: status.status,
      };
    });

    const flyoverPeginSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as FlyoverStatusModel;
      const amount = toSatoshiBigIntString(status.amount);
      const fee = toSatoshiBigIntString(status.fee);
      const total = new SatoshiBig(amount, 'satoshi')
        .plus(new SatoshiBig(fee, 'satoshi'));
      return {
        amountFromString: status.amount,
        amountReceivedString: status.amount,
        total: total.toBTCTrimmedString(),
        fee: status.fee,
        recipientAddress: status.recipientAddress,
        senderAddress: status.senderAddress,
        txId: flyoverStatus.value?.txId,
        btcTxId: status.txHash,
      };
    });

    const summary = computed(() => (props.isFlyover
      ? flyoverPeginSummary.value
      : txPeginSummary.value));

    return {
      typeSummary,
      summary,
    };
  },
});
</script>
