<template>
  <v-container class="statusBar px-0">
    <v-row class="mx-2">
      <v-col cols="auto" class="pt-0">
        <v-img class="d-flex flex-0-0" :src="initialStepImage" width="32" height="32" contain/>
      </v-col>
      <v-col class="px-0">
        <div class="progress-bar"
          :id="`indicator-${timeLineData[0][1]}${txFailed?'-error':''}`"></div>
      </v-col>
        <v-col cols="auto" :class="[txFailed ? 'pt-0' : 'pt-2', 'px-1']">
          <v-img :src="imgStep1" :width="initialImgSize" :height="initialImgSize" contain/>
        </v-col>
        <v-col class="px-0">
          <div class="progress-bar" :id="`indicator-${timeLineData[1][1]}`"></div>
        </v-col>
        <v-col cols="auto" class="pt-2 px-1">
          <v-img :src="imgStep2" width="12" height="12" contain/>
        </v-col>
        <v-col class="px-0">
          <div class="progress-bar" :id="`indicator-${timeLineData[2][1]}`"></div>
        </v-col>
        <v-col cols="auto" class="pt-2 px-1">
          <v-img :src="imgStep3" width="12" height="12" contain/>
        </v-col>
        <v-col class="px-0">
          <div class="progress-bar" :id="`indicator-${timeLineData[3][1]}`"></div>
        </v-col>
      <v-col cols="auto" class="pt-0 pr-0">
        <v-img class="d-flex flex-0-0" :src="finalStepImage" width="32" height="32" contain/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="1" class="pa-0 pl-8">
        <p class="text-left text-bw-400">{{ timeLineData[0][0] }}</p>
      </v-col>
      <v-spacer />
        <v-col class="pa-0 pl-6">
          <p class="text-center text-bw-400">{{ timeLineData[1][0] }}</p>
        </v-col>
        <v-spacer />
        <v-col class="pa-0">
          <p class="text-center text-bw-400">{{ timeLineData[2][0] }}</p>
        </v-col>
        <v-spacer />
        <v-col class="pa-0 pr-4">
          <p class="text-center text-bw-400">{{ timeLineData[3][0] }}</p>
        </v-col>
        <v-spacer />
      <v-col cols="1" class="pa-0 pr-4">
        <p class="text-right text-bw-400">{{ timeLineData[4][0] }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useState, useStateAttribute } from '@/common/store/helper';
import {
  BtcPeginStatus,
  FlyoverStatusModel,
  PeginStatus,
  PegoutStatus,
  PegoutStatusDataModel,
  RskPeginStatus,
  RskStatus,
  TxStatus,
  TxStatusType,
} from '@/common/types';
import { PegStatus, FlyoverStatus } from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default defineComponent({
  name: 'StatusProgressBar',
  props: {
    isFlyover: Boolean,
    txWithErrorType: Boolean,
    txWithError: Boolean,
  },
  setup(props) {
    const status = useState<TxStatus>('status');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const btcTicker = environmentContext.getBtcTicker();
    const rbtcTicker = environmentContext.getRbtcTicker();
    const txFailed = computed(() => props.txWithError
      || status.value.flyoverStatus === FlyoverStatus.FAILED);
    const txDetails = useStateAttribute<PegoutStatusDataModel|PeginStatus|FlyoverStatusModel>('status', 'txDetails');
    const isPegOut = computed((): boolean => status.value.type === TxStatusType.PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGOUT);

    const initialStepImage = computed(() => {
      if (isPegOut.value) {
        return require('@/assets/status/rbtc.svg');
      }
      return require('@/assets/status/btc.svg');
    });
    const finalStepImage = computed(() => {
      if (isPegOut.value) {
        return require('@/assets/status/btc.svg');
      }
      return require('@/assets/status/rbtc.svg');
    });
    const initialImgSize = computed(() => (txFailed.value ? 32 : 12));
    const barColor = computed(() => (txFailed.value ? 'red' : 'green'));
    const timeLineData = computed(() => {
      let labelOne = 'Transaction Broadcasted';
      let labelTwo = 'Transaction Confirmed';
      let labelThree = '';
      let zero = 0;
      let first = 0;
      let second = 0;
      let third = 0;
      let fourth = 0;
      if (props.txWithErrorType) {
        zero = 100;
        labelOne = 'Error occurred';
      } else if (isPegOut.value) {
        labelThree = 'Sent to Bitcoin';
        if (props.isFlyover) {
          labelOne = `Send ${rbtcTicker} to Liquidity Provider`;
          labelTwo = `Liquidity Provider received ${rbtcTicker}`;
          labelThree = `Liquidity Provider send ${btcTicker}`;
          switch (status.value.flyoverStatus) {
            case FlyoverStatus.PENDING:
              zero = 100;
              first = 100;
              second = 70;
              break;
            case FlyoverStatus.SUCCESS:
              zero = 100;
              first = 100;
              second = 100;
              third = 100;
              break;
            case FlyoverStatus.FAILED:
              zero = 100;
              labelOne = 'Error occurred';
              labelTwo = '';
              labelThree = '';
              break;
            default:
              zero = 0;
              first = 0;
              second = 0;
              third = 0;
              fourth = 0;
              labelOne = '';
              labelTwo = '';
              labelThree = '';
              break;
          }
        } else {
          switch (txDetails.value.status as PegoutStatus) {
            case PegoutStatus.PENDING:
              zero = 70;
              break;
            case PegoutStatus.RECEIVED:
              zero = 100;
              first = 50;
              break;
            case PegoutStatus.WAITING_FOR_CONFIRMATION:
              zero = 100;
              first = 100;
              second = 50;
              break;
            case PegoutStatus.WAITING_FOR_SIGNATURE:
              zero = 100;
              first = 100;
              second = 100;
              third = 50;
              break;
            case PegoutStatus.RELEASE_BTC:
              zero = 100;
              first = 100;
              second = 100;
              third = 100;
              fourth = 100;
              break;
            case PegoutStatus.NOT_PEGOUT_TX:
              labelOne = 'Error occurred';
              zero = 100;
              break;
            case PegoutStatus.NOT_FOUND:
              labelOne = 'Error occurred';
              zero = 100;
              break;
            case PegoutStatus.REJECTED:
              labelOne = 'Error occurred';
              zero = 100;
              break;
            default:
              zero = 0;
              first = 0;
              second = 0;
              third = 0;
              fourth = 0;
              labelThree = '';
          }
        }
      } else if (props.isFlyover) {
        labelOne = `Send ${btcTicker} to Liquidity Provider`;
        labelTwo = `Liquidity Provider received ${btcTicker}`;
        labelThree = `Liquidity Provider send ${rbtcTicker}`;
        switch (status.value.flyoverStatus) {
          case FlyoverStatus.PENDING:
            zero = 100;
            first = 100;
            second = 70;
            break;
          case FlyoverStatus.SUCCESS:
            zero = 100;
            first = 100;
            second = 100;
            third = 100;
            break;
          case FlyoverStatus.FAILED:
            zero = 100;
            labelOne = 'Error occurred';
            labelTwo = '';
            labelThree = '';
            break;
          default:
            zero = 0;
            first = 0;
            second = 0;
            third = 0;
            fourth = 0;
            labelOne = '';
            labelTwo = '';
            labelThree = '';
            break;
        }
      } else {
        const txDetailsPegIn = txDetails.value as PeginStatus;
        const btc = txDetailsPegIn.btc as BtcPeginStatus;
        const rsk = txDetailsPegIn.rsk as RskPeginStatus;
        labelThree = 'Confirming on Rootstock';
        switch (txDetailsPegIn.status as PegStatus) {
          case PegStatus.NOT_IN_BTC_YET:
            zero = 50;
            break;
          case PegStatus.WAITING_CONFIRMATIONS:
            zero = 100;
            first = 50;
            if (btc.confirmations >= btc.requiredConfirmation) {
              first = 100;
              second = 70;
            }
            break;
          case PegStatus.NOT_IN_RSK_YET:
            zero = 100;
            first = 100;
            second = 100;
            third = 50;
            break;
          case PegStatus.CONFIRMED:
            zero = 100;
            first = 100;
            second = 100;
            third = 50;
            if (rsk.status === RskStatus.LOCKED) {
              third = 100;
            }
            break;
          case PegStatus.REJECTED_REFUND:
            labelOne = 'Error occurred';
            zero = 100;
            break;
          case PegStatus.REJECTED_NO_REFUND:
            labelOne = 'Error occurred';
            zero = 100;
            break;
          case PegStatus.ERROR_BELOW_MIN:
            labelOne = 'Error occurred';
            zero = 100;
            break;
          case PegStatus.ERROR_NOT_A_PEGIN:
            labelOne = 'Error occurred';
            zero = 100;
            break;
          case PegStatus.ERROR_UNEXPECTED:
            labelOne = 'Error occurred';
            zero = 100;
            break;
          default:
            zero = 0;
            first = 0;
            second = 0;
            third = 0;
            fourth = 0;
            labelOne = '';
            labelTwo = '';
            labelThree = '';
            break;
        }
      }
      return {
        0: [isPegOut.value ? 'Rootstock Network' : 'Bitcoin Network', zero],
        1: [labelOne, first],
        2: [labelTwo, second],
        3: [labelThree, third],
        4: [isPegOut.value ? 'Bitcoin Network' : 'Rootstock Network', fourth],
      };
    });
    const imgStep1 = computed(() => {
      if (txFailed.value) return require('@/assets/status/ellipse_error.svg');
      if (timeLineData.value[0][1] === 100) return require('@/assets/status/ellipse.svg');
      return require('@/assets/status/ellipse_empty.svg');
    });
    const imgStep2 = computed(() => {
      if (timeLineData.value[1][1] === 100) {
        return require('@/assets/status/ellipse.svg');
      }
      return require('@/assets/status/ellipse_empty.svg');
    });
    const imgStep3 = computed(() => {
      if (timeLineData.value[2][1] === 100) {
        return require('@/assets/status/ellipse.svg');
      }
      return require('@/assets/status/ellipse_empty.svg');
    });
    return {
      isPegOut,
      initialStepImage,
      finalStepImage,
      timeLineData,
      imgStep1,
      imgStep2,
      imgStep3,
      initialImgSize,
      barColor,
      txFailed,
    };
  },
});
</script>

<style scoped>
.progress-bar {
  height: 4px;
  background-color: rgba(58, 58, 58, 0.5);
  width: 100%;
}
#indicator-50 {
  background-image: linear-gradient(to right,
    rgb(var(--v-theme-green)) 30%, rgba(58, 58, 58, 0.3));
}
#indicator-70 {
  background-image: linear-gradient(to right,
    rgb(var(--v-theme-green)) 60%, rgba(58, 58, 58, 0.3));
}
#indicator-100 {
  background-color: rgb(var(--v-theme-green)) !important;
}
#indicator-100-error {
  background-color: red !important;
}
#indicator-0 {
  background-color: rgba(58, 58, 58, 0.5)  !important;
}

</style>
