<template>
  <v-col>
    <v-container fluid class="pa-0 mb-1 mt-7 max-width">
      <v-row justify="center" class="mt-6">
        <v-col class="ma-0 pa-0" cols="7">
           <!-- isReject -->
          <v-row v-if="isRejected" class="mx-0 d-flex justify-center progress-bar">
            <v-col cols="8" class="pa-0 d-flex justify-center">
              <v-row>
                <div class="rsk-icon-green">
                  <v-row>
                    <v-img class="icon-status-image
                      icon-rootstock-image-reject
                      icon-status-border-yellow d-flex justify-center"
                      src="@/assets/status/rootstock.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-4">
                    <h1>{{environmentContext.getRskText()}} Network</h1>
                  </v-row>
                </div>
                <v-progress-linear
                  :value="btcConfirmationsPercentage"
                  color="#F6C61B"
                  height="19"/>
                <div class="d-flex justify-end">
                  <div class="bitcoin-icon-yellow">
                    <v-row>
                      <v-img class="icon-status-image
                        icon-btc-image-reject
                        icon-status-border-yellow d-flex justify-center"
                        src="@/assets/status/btc.png" height="78" contain/>
                    </v-row>
                    <v-row class="mt-4">
                      <h1>Refund {{environmentContext.getBtcText()}} address</h1>
                    </v-row>
                  </div>
                </div>
              </v-row>
            </v-col>
          </v-row>

          <!-- success -->
          <v-row v-else class="mx-0 progress-bar">
            <v-col  cols="8" class="pa-0">
              <div class="d-flex justify-start">
                <div class="bitcoin-icon-green">
                  <v-row>
                    <v-img v-bind:class="bordersStyle.btc"
                      class="icon-status-image icon-btc-image d-flex justify-center"
                      src="@/assets/status/btc.png" height="78" contain/>
                  </v-row>
                  <v-row class="mt-5">
                    <v-col>
                      <h1>{{environmentContext.getBtcText()}} Network</h1>
                    </v-col>
                  </v-row>
                </div>
              </div>

              <v-progress-linear
                class="progress-bar-status_new"
                :value="btcConfirmationsPercentage"
                :color="currentBtcBarColor"
                height="19" />

                <div v-bind:class="`btc-circle ${btcCircleColor}`"></div>
              <v-row v-if="!btcConfirmationsAreDone" justify="center" class="mt-3 pa-0">
                <h5>
                  {{btcConfirmations}}/{{btcConfirmationsRequired}} confirmations
                </h5>
                <v-tooltip right>
                  <template v-slot:activator="{props}">
                    <v-icon x-small color="teal darken-2" v-bind="props.attrs" v-on="props.on">
                      mdi-information
                    </v-icon>
                  </template>
                  <p class="tooltip-form mb-0">
                    The estimated time is calculated based on a 10-minute block time.
                  </p>
                </v-tooltip>
              </v-row>
              <v-row v-if="!btcConfirmationsAreDone" justify="center" class="mt-2 pa-0">
                <h5>
                  Estimated time left: {{leftBtcTime}} hours
                </h5>
              </v-row>
            </v-col>
            <v-col cols="auto" class="pa-0 d-flex justify-center">
              <div class="img-progress-bar">
                <v-row>
                  <v-img v-bind:class="bordersStyle.rootstock"
                    class="icon-status-image icon-rootstock-image d-flex justify-center"
                    src="@/assets/status/rootstock.png" height="78" contain/>
                </v-row>
                <v-row class="mt-5">
                  <h1>{{environmentContext.getRskText()}} Network</h1>
                </v-row>
              </div>
            </v-col>
            <v-col class="confirm-percentage pa-0">
              <v-row>
                <v-progress-linear
                class="progress-bar-status_new"
                :value="rskConfirmationsPercentage"
                :color="currentRskBarColor"
                height="19"/>
                <div v-bind:class="`rsk-circle ${rskCircleColor}`"></div>

                <v-row justify="center" class="mt-2 mx-0 pa-0 mb-0 confirmations-message" >
                  <h6 v-if="!rskConfirmationsAreDone">
                    Usually takes around 20 minutes
                  </h6>
                </v-row>

                <div class="d-flex justify-end pa-0 ma-0">
                  <div class="rbtc-icon-green">
                    <v-row>
                      <v-img v-bind:class="bordersStyle.rbtc"
                        class="icon-status-image icon-rbtc-image d-flex justify-center"
                        src="@/assets/status/rbtc.png" height="78" contain/>
                    </v-row>
                    <v-row class="justify-center mt-5">
                      <h1
                      :style="rskConfirmationsPercentage === 100 ?
                      `color:#00B520;` : ``">
                      {{environmentContext.getRbtcTicker()}} delivered
                      </h1>
                    </v-row>
                  </div>
                </div>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-row class="mt-12">
      <tx-summary-fixed
        :summary="txPeginSummary"
        :initialExpand="true"
        :type="typeSummary"
        :orientation="orientationSummary"/>
    </v-row>
  </v-col>
</template>

<script lang="ts">
import {
  computed, reactive, ref, watch, defineComponent,
} from 'vue';
import {
  PeginStatus,
  SatoshiBig,
  TxStatusType, TxSummaryOrientation, NormalizedSummary, TxStatusMessage,
} from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import { getTime, setStatusMessage } from '@/common/utils';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import TxSummaryFixed from '@/common/components/exchange/TxSummaryFixed.vue';

export default defineComponent({
  name: 'TxPegin',
  components: {
    TxSummaryFixed,
  },
  props: {
    txId: String,
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

    const typeSummary = TxStatusType.PEGIN;
    const orientationSummary = TxSummaryOrientation.HORIZONTAL;
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const txDetails = useStateAttribute<PeginStatus>('status', 'txDetails');
    // const type = useStateAttribute<TxStatusType>('status', 'type');
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

    // const showSteps = computed((): boolean => type.value !== TxStatusType.UNSET_STATUS);

    const txPeginSummary = computed((): NormalizedSummary => {
      const status = txDetails.value;
      return {
        amountFromString: status.btc.amountTransferred.toString(),
        amountReceivedString: status.btc.amountTransferred.toString(),
        fee: status.btc.fees,
        recipientAddress: status.rsk.recipientAddress,
        txId: status.btc.txId,
        refundAddress: status.btc.refundAddress,
        federationAddress: status.btc.federationAddress,
      };
    });

    function refreshPercentage() {
      if (txDetails) {
        const { btc } = txDetails.value;
        btcConfirmationsRequired.value = btc.requiredConfirmation;
        btcConfirmations.value = btc.confirmations ?? 0;
        btcConfirmations.value = btcConfirmations.value > btcConfirmationsRequired.value
          ? btcConfirmationsRequired.value : btcConfirmations.value;
      }
      leftBtcTime.value = getTime((btcConfirmationsRequired.value - btcConfirmations.value) * 10);
      btcConfirmationsPercentage.value = btcConfirmations.value <= btcConfirmationsRequired.value
        ? (btcConfirmations.value * 100) / btcConfirmationsRequired.value : 100;
      if (txDetails.value.status === constants.PegStatus.CONFIRMED) {
        rskConfirmationsPercentage.value = 100;
      } else {
        rskConfirmationsPercentage.value = 0;
      }
    }

    function setSummaryData() {
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

    function setMessage() {
      let msg: TxStatusMessage | string = '';
      if (txDetails) {
        msg = setStatusMessage(TxStatusType.PEGIN, txDetails.value.status);
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

    watch(() => txDetails.value.status, setMessage);

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
      txPeginSummary,
      btcConfirmationsAreDone,
      rskConfirmationsAreDone,
      isRejected,
    };
  },
});
</script>