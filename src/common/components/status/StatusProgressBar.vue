<template>
  <v-container class="mx-16">
    <v-row class="mx-2">
      <v-col cols="auto" class="pt-0">
        <v-img class="d-flex flex-0-0" :src="initialStepImage" width="32" height="32" contain/>
      </v-col>
      <v-col class="px-0">
        <v-progress-linear color="green" :model-value="timeLineData[0][1]" />
      </v-col>
      <v-col cols="auto" class="pt-2 px-1">
        <v-img :src="require('@/assets/status/ellipse.svg')" width="12" height="12" contain/>
      </v-col>
      <v-col class="px-0">
        <v-progress-linear color="green" :model-value="timeLineData[1][1]" />
      </v-col>
      <v-col cols="auto" class="pt-2 px-1">
        <v-img :src="require('@/assets/status/ellipse.svg')" width="12" height="12" contain/>
      </v-col>
      <v-col class="px-0">
        <v-progress-linear color="green" :model-value="timeLineData[2][1]" />
      </v-col>
      <v-col cols="auto" class="pt-2 px-1">
        <v-img :src="require('@/assets/status/ellipse.svg')" width="12" height="12" contain/>
      </v-col>
      <v-col class="px-0">
        <v-progress-linear color="green" :model-value="timeLineData[3][1]" />
      </v-col>
      <v-col cols="auto" class="pt-0">
        <v-img class="d-flex flex-0-0" :src="finalStepImage" width="32" height="32" contain/>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pa-0">
        <p class="text-center text-bw-400">{{ timeLineData[0][0] }}</p>
      </v-col>
      <v-spacer />
      <v-col class="pa-0">
        <p class="text-center text-bw-400">{{ timeLineData[1][0] }}</p>
      </v-col>
      <v-spacer />
      <v-col class="pa-0">
        <p class="text-center text-bw-400">{{ timeLineData[2][0] }}</p>
      </v-col>
      <v-spacer />
      <v-col class="pa-0">
        <p class="text-center text-bw-400">{{ timeLineData[3][0] }}</p>
      </v-col>
      <v-spacer />
      <v-col class="pa-0">
        <p class="text-center text-bw-400">{{ timeLineData[4][0] }}</p>
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
  RskPeginStatus, RskStatus,
  TxStatus,
  TxStatusType,
} from '@/common/types';
import { PegStatus } from '@/common/store/constants';

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

    const initialStepImage = computed(() => {
      if (isPegOut.value) {
        return require('@/assets/status/btc.svg');
      }
      return require('@/assets/status/rbtc.svg');
    });
    const finalStepImage = computed(() => {
      if (isPegOut.value) {
        return require('@/assets/status/rbtc.svg');
      }
      return require('@/assets/status/btc.svg');
    });
    const timeLineData = computed(() => {
      let labelOne = 'step';
      let labelTwo = 'step';
      let labelThree = 'step';
      let zero = 0;
      let first = 0;
      let second = 0;
      let third = 0;
      let fourth = 0;
      if (isPegOut.value) {
        if (props.isFlyover) {
          zero = 50;
        } else {
          switch (txDetails.value.status as PegoutStatus) {
            case PegoutStatus.PENDING:
              zero = 60;
              break;
            case PegoutStatus.RECEIVED:
              zero = 100;
              break;
            case PegoutStatus.WAITING_FOR_CONFIRMATION:
              zero = 100;
              first = 60;
              break;
            case PegoutStatus.WAITING_FOR_SIGNATURE:
              zero = 100;
              first = 100;
              second = 50;
              break;
            case PegoutStatus.RELEASE_BTC:
              zero = 100;
              first = 100;
              second = 100;
              third = 100;
              fourth = 100;
              break;
            default:
              zero = 0;
              first = 0;
              second = 0;
              third = 0;
              fourth = 0;
              labelOne = 'step';
              labelTwo = 'step';
              labelThree = 'step';
          }
        }
      } else {
        const txDetailsPegIn = txDetails.value as PeginStatus;
        const btc = txDetailsPegIn.btc as BtcPeginStatus;
        const rsk = txDetailsPegIn.rsk as RskPeginStatus;
        labelOne = 'Transaction Broadcasted';
        labelTwo = 'Transaction Confirmed';
        labelThree = 'Confirming on Rootstock';
        switch (txDetailsPegIn.status as PegStatus) {
          case PegStatus.NOT_IN_BTC_YET:
            zero = 60;
            break;
          case PegStatus.WAITING_CONFIRMATIONS:
            if (btc.confirmations >= btc.requiredConfirmation) {
              first = 100;
            }
            zero = 100;
            first = 60;
            break;
          case PegStatus.NOT_IN_RSK_YET:
            zero = 100;
            first = 100;
            second = 60;
            break;
          case PegStatus.CONFIRMED:
            if (rsk.status === RskStatus.LOCKED) {
              third = 100;
            }
            zero = 100;
            first = 100;
            second = 100;
            break;
          default:
            zero = 0;
            first = 0;
            second = 0;
            third = 0;
            fourth = 0;
            labelOne = 'step';
            labelTwo = 'step';
            labelThree = 'step';
            break;
        }
      }
      return {
        0: [isPegOut.value ? 'Bitcoin Network' : 'Rootstock Network', zero],
        1: [labelOne, first],
        2: [labelTwo, second],
        3: [labelThree, third],
        4: [isPegOut.value ? 'Rootstock Network' : 'Bitcoin Network', fourth],
      };
    });
    return {
      isPegOut,
      initialStepImage,
      finalStepImage,
      timeLineData,
    };
  },
});
</script>
