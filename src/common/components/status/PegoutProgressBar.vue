<template>
  <v-container fluid class="pa-0 mb-1 mt-0 max-width">
    <v-row justify="center" class="mt-6">
      <v-col class="ma-0 pa-0" cols="7">
        <v-row class="mx-0 d-flex justify-center progress-bar">
          <v-col cols="8" class="pa-0 d-flex justify-center">
            <v-row>
              <div class="rsk-icon-green">
                <v-row>
                  <v-img v-bind:class="bordersStyle.rbtc"
                    class="icon-status-image icon-rbtc-image d-flex justify-center"
                    :src="require('@/assets/status/rbtc.png')" height="78" contain/>
                </v-row>
              </div>
              <div>
                <v-row>
                  <div v-bind:class="firstCircle"
                  class="btc-circle first-pegout-circle"></div>
                </v-row>
              </div>
              <div>
                <v-row>
                  <div v-bind:class="secondCircle"
                  class="btc-circle second-pegout-circle"></div>
                </v-row>
              </div>
              <div>
                <v-row>
                  <div v-bind:class="thirdCircle"
                  class="btc-circle third-pegout-circle"></div>
                </v-row>
              </div>
              <v-progress-linear
                class="progress-bar-status_new"
                :model-value="percentage"
                :color="currentBarColor"
                height="19"/>
              <div class="d-flex justify-end">
                <div class="bitcoin-icon-yellow">
                  <v-row>
                    <v-img v-bind:class="bordersStyle.btc"
                      class="icon-status-image icon-btc-image-pegout d-flex justify-center"
                      :src="require('@/assets/status/btc.png')" height="78" contain/>
                  </v-row>
                </div>
              </div>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
/* eslint-disable */
import {
  computed, reactive, ref, watch, defineComponent,
} from 'vue';
import * as constants from '@/common/store/constants';
import { PegoutStatus, PegoutStatusDataModel } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useGetter, useStateAttribute } from '@/common/store/helper';

export default defineComponent({
  name: 'PegoutProgressBar',
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const colors = {
      blue: '#3D7DA1',
      gray: '#8c8c8c',
      green: '#9CE07B',
      yellow: '#F6C61B',
    };
    const circleColor = {
      blue: 'circle-blue',
      gray: 'circle-gray',
      green: 'circle-green',
      yellow: 'circle-yellow',
    };
    const borderColor = {
      blue: 'icon-status-border-blue',
      gray: 'icon-status-border-gray',
      green: 'icon-status-border-green',
      yellow: 'icon-status-border-yellow',
    };
    const currentBarColor = ref(colors.gray);
    const firstCircle = ref(circleColor.gray);
    const secondCircle = ref(circleColor.gray);
    const thirdCircle = ref(circleColor.gray);
    const bordersStyle = reactive({
      btc: borderColor.gray,
      rbtc: borderColor.gray,
    });

    const txDetails = useStateAttribute<PegoutStatusDataModel>('status', 'txDetails');

    const isRejected = useGetter<boolean>('status', constants.STATUS_IS_REJECTED);

    const currentStatus = computed(() => txDetails.value.status);

    const showRejectedMsg = computed(() => currentStatus.value === PegoutStatus.REJECTED);

    const percentage = computed(() => {
      switch (txDetails.value.status) {
        case PegoutStatus.REJECTED:
          currentBarColor.value = colors.yellow;
          bordersStyle.rbtc = borderColor.yellow;
          bordersStyle.btc = borderColor.gray;
          firstCircle.value = circleColor.yellow;
          return 15;
        case PegoutStatus.WAITING_FOR_SIGNATURE:
          currentBarColor.value = colors.blue;
          bordersStyle.rbtc = borderColor.blue;
          bordersStyle.btc = borderColor.gray;
          firstCircle.value = circleColor.blue;
          secondCircle.value = circleColor.blue;
          thirdCircle.value = circleColor.blue;
          return 90;
        case PegoutStatus.RECEIVED:
          currentBarColor.value = colors.blue;
          bordersStyle.rbtc = borderColor.blue;
          bordersStyle.btc = borderColor.gray;
          firstCircle.value = circleColor.blue;
          return 30;
        case PegoutStatus.WAITING_FOR_CONFIRMATION:
          currentBarColor.value = colors.blue;
          bordersStyle.rbtc = borderColor.blue;
          bordersStyle.btc = borderColor.gray;
          firstCircle.value = circleColor.blue;
          secondCircle.value = circleColor.blue;
          return 60;
        case PegoutStatus.RELEASE_BTC:
          currentBarColor.value = colors.green;
          bordersStyle.rbtc = borderColor.green;
          bordersStyle.btc = borderColor.green;
          firstCircle.value = circleColor.green;
          secondCircle.value = circleColor.green;
          thirdCircle.value = circleColor.green;
          return 100;
        default:
          currentBarColor.value = colors.gray;
          bordersStyle.rbtc = borderColor.gray;
          bordersStyle.btc = borderColor.gray;
          firstCircle.value = circleColor.gray;
          secondCircle.value = circleColor.gray;
          thirdCircle.value = circleColor.gray;
          return 0;
      }
    });

    return {
      environmentContext,
      currentBarColor,
      firstCircle,
      secondCircle,
      thirdCircle,
      bordersStyle,
      isRejected,
      percentage,
      currentStatus,
      showRejectedMsg,
    };
  },
});
</script>