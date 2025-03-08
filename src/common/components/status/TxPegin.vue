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
import {
  computed, reactive, ref, defineComponent,
} from 'vue';
import { mdiInformation } from '@mdi/js';
import {
  PeginStatus,
  SatoshiBig,
  TxStatusType,
  TxSummaryOrientation,
  NormalizedSummary,
  TxStatusMessage,
  FlyoverStatusModel,
  TxStatus,
} from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import { getTime, setStatusMessage } from '@/common/utils';
import {
  useAction, useGetter, useStateAttribute,
} from '@/common/store/helper';
import StatusProgressBar from '@/common/components/status/StatusProgressBar.vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
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
  setup(props, context) {
    const currentFee = ref(new SatoshiBig('0', 'btc'));
    const currentRefundAddress = ref('');
    const btcConfirmationsRequired = ref(0);
    const btcConfirmationsPercentage = ref(0);
    const btcConfirmations = ref(0);
    const rskConfirmationsPercentage = ref(0);
    const leftBtcTime = ref('');

    const colors = {
      blue: '#3D7DA1',
      gray: '#8c8c8c',
      green: '#9CE07B',
    };

    const circleColor = {
      blue: 'circle-blue',
      gray: 'circle-gray',
      green: 'circle-green',
    };

    const borderColor = {
      blue: 'icon-status-border-blue',
      gray: 'icon-status-border-gray',
      green: 'icon-status-border-green',
    };

    const rskCircleColor = ref(circleColor.gray);
    const btcCircleColor = ref(circleColor.gray);
    const currentBtcBarColor = ref(colors.gray);
    const currentRskBarColor = ref(colors.gray);

    const bordersStyle = reactive({
      btc: borderColor.gray,
      rootstock: borderColor.gray,
      rbtc: borderColor.gray,
    });

    const typeSummary = props.isFlyover ? TxStatusType.FLYOVER_PEGIN : TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const txDetails = useStateAttribute<PeginStatus | FlyoverStatusModel>('status', 'txDetails');
    const flyoverStatus = useStateAttribute<TxStatus['flyoverStatus']>('status', 'flyoverStatus');
    const isRejected = useGetter<boolean>('status', constants.STATUS_IS_REJECTED);
    const setAmount = useAction('pegInTx', constants.PEGIN_TX_ADD_AMOUNT_TO_TRANSFER);
    const peginInit = useAction('pegInTx', constants.PEGIN_TX_INIT);
    const setRskAddress = useAction('pegInTx', constants.PEGIN_TX_ADD_RSK_ADDRESS);

    const btcConfirmationsAreDone = computed(
      () => btcConfirmations.value >= btcConfirmationsRequired.value,
    );

    const rskConfirmationsAreDone = computed(
      () => txDetails.value.status === constants.PegStatus.CONFIRMED,
    );

    const isMainnet = computed(() => EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin
      === constants.BTC_NETWORK_MAINNET);

    const txPeginSummary = computed((): NormalizedSummary => {
      const status = txDetails.value as PeginStatus;
      const total = new SatoshiBig(status.btc.amountTransferred, 'btc')
        .minus(new SatoshiBig(status.btc.fees, 'btc'));
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
      const total = new SatoshiBig(status.amount, 'btc')
        .plus(new SatoshiBig(status.fee, 'btc'));
      return {
        amountFromString: status.amount.toString(),
        amountReceivedString: status.amount.toString(),
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

    function refreshPercentage() {
      if ('btc' in txDetails.value) {
        const { btc } = txDetails.value;
        btcConfirmationsRequired.value = btc.requiredConfirmation;
        btcConfirmations.value = btc.confirmations ?? 0;
        btcConfirmations.value = btcConfirmations.value > btcConfirmationsRequired.value
          ? btcConfirmationsRequired.value : btcConfirmations.value;
        leftBtcTime.value = getTime((btcConfirmationsRequired.value - btcConfirmations.value) * 10);
        btcConfirmationsPercentage.value = btcConfirmations.value <= btcConfirmationsRequired.value
          ? (btcConfirmations.value * 100) / btcConfirmationsRequired.value : 100;
        if (txDetails.value.status === constants.PegStatus.CONFIRMED) {
          rskConfirmationsPercentage.value = 100;
        } else {
          rskConfirmationsPercentage.value = 0;
        }
      }
    }

    function setSummaryData() {
      if ('btc' in txDetails.value) {
        const { btc, rsk } = txDetails.value;
        const txData = {
          amount: new SatoshiBig(btc.amountTransferred, 'btc'),
          refundAddress: btc.refundAddress,
          recipient: rsk.recipientAddress ? rsk.recipientAddress : '',
          feeBTC: new SatoshiBig(btc.fees, 'btc'),
          change: '',
        };
        peginInit();
        setAmount(txData.amount);
        currentFee.value = txData.feeBTC;
        currentRefundAddress.value = txData.refundAddress;
        setRskAddress(txData.recipient);
      }
    }

    function setMessage() {
      let msg: TxStatusMessage | string = '';
      if (txDetails.value) {
        const type = props.isFlyover ? TxStatusType.FLYOVER_PEGIN : TxStatusType.PEGIN;
        msg = setStatusMessage(type, txDetails.value.status);
      }
      context.emit('setMessage', msg);
    }

    function setProgressColor() {
      if (btcConfirmationsPercentage.value <= 1) {
        currentBtcBarColor.value = colors.gray;
        bordersStyle.btc = borderColor.gray;
        bordersStyle.rootstock = borderColor.gray;
        bordersStyle.rbtc = borderColor.gray;
      } else if (btcConfirmationsPercentage.value > 1
        && btcConfirmationsPercentage.value < 100) {
        currentBtcBarColor.value = colors.blue;

        bordersStyle.btc = borderColor.blue;
        bordersStyle.rootstock = borderColor.gray;
        bordersStyle.rbtc = borderColor.gray;
      } else {
        currentBtcBarColor.value = colors.blue;
        currentRskBarColor.value = colors.blue;

        bordersStyle.btc = borderColor.blue;
        bordersStyle.rootstock = borderColor.blue;
        bordersStyle.rbtc = borderColor.gray;
      }

      if (rskConfirmationsPercentage.value === 100) {
        currentBtcBarColor.value = colors.green;
        currentRskBarColor.value = colors.green;

        bordersStyle.btc = borderColor.green;
        bordersStyle.rootstock = borderColor.green;
        bordersStyle.rbtc = borderColor.green;
      }
    }

    function setCircleColor() {
      if (btcConfirmationsPercentage.value <= 50) {
        btcCircleColor.value = circleColor.gray;
      } else if (btcConfirmationsPercentage.value > 50
        && btcConfirmationsPercentage.value <= 100) {
        btcCircleColor.value = circleColor.blue;
      }

      if (rskConfirmationsPercentage.value <= 50) {
        rskCircleColor.value = circleColor.gray;
      } else if (rskConfirmationsPercentage.value > 50
        && rskConfirmationsPercentage.value < 100) {
        rskCircleColor.value = circleColor.blue;
      } else {
        btcCircleColor.value = circleColor.green;
        rskCircleColor.value = circleColor.green;
      }
    }

    setSummaryData();
    refreshPercentage();
    setMessage();
    setProgressColor();
    setCircleColor();

    return {
      currentFee,
      currentRefundAddress,
      btcConfirmationsRequired,
      btcConfirmationsPercentage,
      btcConfirmations,
      rskConfirmationsPercentage,
      leftBtcTime,
      rskCircleColor,
      btcCircleColor,
      currentBtcBarColor,
      currentRskBarColor,
      bordersStyle,
      typeSummary,
      orientationSummary,
      environmentContext,
      summary,
      btcConfirmationsAreDone,
      rskConfirmationsAreDone,
      isRejected,
      mdiInformation,
      isMainnet,
    };
  },
});
</script>
