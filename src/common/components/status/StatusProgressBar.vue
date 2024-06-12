<template>
  <v-container class="px-0">
    <v-row class="mx-2">
      <v-col cols="auto" class="pt-0">
        <v-img class="d-flex flex-0-0" :src="initialStepImage" width="32" height="32" contain/>
      </v-col>
      <v-col class="px-0">
        <v-progress-linear color="green" :model-value="timeLineData[0][1]" />
      </v-col>
      <template v-if="!isFlyover">
        <v-col cols="auto" class="pt-2 px-1">
          <v-img :src="imgStep1" width="12" height="12" contain/>
        </v-col>
        <v-col class="px-0">
          <v-progress-linear color="green" :model-value="timeLineData[1][1]" />
        </v-col>
        <v-col cols="auto" class="pt-2 px-1">
          <v-img :src="imgStep2" width="12" height="12" contain/>
        </v-col>
        <v-col class="px-0">
          <v-progress-linear color="green" :model-value="timeLineData[2][1]" />
        </v-col>
        <v-col cols="auto" class="pt-2 px-1">
          <v-img :src="imgStep3" width="12" height="12" contain/>
        </v-col>
        <v-col class="px-0">
          <v-progress-linear color="green" :model-value="timeLineData[3][1]" />
        </v-col>
      </template>
      <v-col cols="auto" class="pt-0 pr-0">
        <v-img class="d-flex flex-0-0" :src="finalStepImage" width="32" height="32" contain/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="1" class="pa-0 pl-8">
        <p class="text-left text-bw-400">{{ timeLineData[0][0] }}</p>
      </v-col>
      <v-spacer />
      <template v-if="!isFlyover">
        <v-col class="pa-0 pr-4">
          <p class="text-center text-bw-400">{{ timeLineData[1][0] }}</p>
        </v-col>
        <v-spacer />
        <v-col class="pa-0">
          <p class="text-center text-bw-400">{{ timeLineData[2][0] }}</p>
        </v-col>
        <v-spacer />
        <v-col class="pa-0 pl-4">
          <p class="text-center text-bw-400">{{ timeLineData[3][0] }}</p>
        </v-col>
        <v-spacer />
      </template>
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
  PeginStatus,
  PegoutStatus,
  PegoutStatusDataModel,
  RskPeginStatus,
  RskStatus,
  TxStatus,
  TxStatusType,
} from '@/common/types';
import { PegStatus, FlyoverPegoutStatus } from '@/common/store/constants';

export default defineComponent({
  name: 'StatusProgressBar',
  props: {
    isFlyover: Boolean,
  },
  setup(props) {
    const status = useState<TxStatus>('status');
    const txDetails = useStateAttribute<PegoutStatusDataModel|PeginStatus>('status', 'txDetails');
    const isPegOut = computed((): boolean => status.value.type === TxStatusType.PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGOUT);
    const txWithErrorType = computed((): boolean => status.value.type === TxStatusType.INVALID_DATA
      || status.value.type === TxStatusType.UNEXPECTED_ERROR);

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
    const txWithError = computed(() => {
      if (txWithErrorType.value) return true;
      const { status: errorStatus } = txDetails.value;
      return errorStatus as PegStatus === PegStatus.REJECTED_REFUND
      || errorStatus as PegStatus === PegStatus.REJECTED_NO_REFUND
      || errorStatus as PegStatus === PegStatus.ERROR_BELOW_MIN
      || errorStatus as PegStatus === PegStatus.ERROR_NOT_A_PEGIN
      || errorStatus as PegStatus === PegStatus.ERROR_UNEXPECTED
      || errorStatus as PegoutStatus === PegoutStatus.NOT_PEGOUT_TX
      || errorStatus as PegoutStatus === PegoutStatus.NOT_FOUND
      || errorStatus as PegoutStatus === PegoutStatus.REJECTED;
    });
    const timeLineData = computed(() => {
      let labelOne = 'Transaction Broadcasted';
      let labelTwo = 'Transaction Confirmed';
      let labelThree = '';
      let zero = 0;
      let first = 0;
      let second = 0;
      let third = 0;
      let fourth = 0;
      if (txWithErrorType.value) zero = 100;
      else if (isPegOut.value) {
        labelThree = 'Sent to Bitcoin';
        if (props.isFlyover) {
          if ((txDetails.value.status as unknown as FlyoverPegoutStatus) === FlyoverPegoutStatus
            .COMPLETED) zero = 100;
          else zero = 60;
        } else {
          switch (txDetails.value.status as PegoutStatus) {
            case PegoutStatus.PENDING:
              zero = 95;
              break;
            case PegoutStatus.RECEIVED:
              zero = 100;
              first = 70;
              break;
            case PegoutStatus.WAITING_FOR_CONFIRMATION:
              zero = 100;
              first = 100;
              second = 70;
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
              zero = 100;
              break;
            case PegoutStatus.NOT_FOUND:
              zero = 100;
              break;
            case PegoutStatus.REJECTED:
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
      } else {
        const txDetailsPegIn = txDetails.value as PeginStatus;
        const btc = txDetailsPegIn.btc as BtcPeginStatus;
        const rsk = txDetailsPegIn.rsk as RskPeginStatus;
        labelThree = 'Confirming on Rootstock';
        switch (txDetailsPegIn.status as PegStatus) {
          case PegStatus.NOT_IN_BTC_YET:
            zero = 60;
            break;
          case PegStatus.WAITING_CONFIRMATIONS:
            zero = 100;
            first = 60;
            if (btc.confirmations >= btc.requiredConfirmation) {
              first = 100;
              second = 60;
            }
            break;
          case PegStatus.NOT_IN_RSK_YET:
            zero = 100;
            first = 100;
            second = 100;
            third = 60;
            break;
          case PegStatus.CONFIRMED:
            zero = 100;
            first = 100;
            second = 100;
            if (rsk.status === RskStatus.LOCKED) {
              third = 100;
            }
            break;
          case PegStatus.REJECTED_REFUND:
            zero = 100;
            break;
          case PegStatus.REJECTED_NO_REFUND:
            zero = 100;
            break;
          case PegStatus.ERROR_BELOW_MIN:
            zero = 100;
            break;
          case PegStatus.ERROR_NOT_A_PEGIN:
            zero = 100;
            break;
          case PegStatus.ERROR_UNEXPECTED:
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
      if (txWithError.value) return require('@/assets/status/ellipse_error.svg');
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
      txWithError,
      imgStep1,
      imgStep2,
      imgStep3,
    };
  },
});
</script>
