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
                    src="@/assets/status/rbtc.png" height="78" contain/>
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
                :value="percentage"
                :color="currentBarColor"
                style="opacity: 75% !important;"
                height="19"/>
              <div class="d-flex justify-end">
                <div class="bitcoin-icon-yellow">
                  <v-row>
                    <v-img v-bind:class="bordersStyle.btc"
                      class="icon-status-image icon-btc-image-pegout d-flex justify-center"
                      src="@/assets/status/btc.png" height="78" contain/>
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
import * as constants from '@/common/store/constants';
import { PegoutStatus, PegoutStatusDataModel } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { computed, reactive, ref } from 'vue';
import { useGetter, useStateAttribute } from '@/common/store/helper';

export default {
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

    const isRejected = useGetter<Boolean>('status', constants.STATUS_IS_REJECTED);

    const percentage = computed(() => {
      let percentage;
      switch (txDetails.value.status) {
        case PegoutStatus.REJECTED:
          currentBarColor.value = colors.yellow;
          bordersStyle.rbtc = borderColor.yellow;
          bordersStyle.btc = borderColor.gray;

          firstCircle.value = circleColor.yellow;
          percentage = 15;
          break;
        case PegoutStatus.WAITING_FOR_SIGNATURE:
          currentBarColor.value = colors.blue;
          bordersStyle.rbtc = borderColor.blue;
          bordersStyle.btc = borderColor.gray;

          firstCircle.value = circleColor.blue;
          secondCircle.value = circleColor.blue;
          thirdCircle.value = circleColor.blue;
          percentage = 90;
          break;
        case PegoutStatus.RECEIVED:
          currentBarColor.value = colors.blue;
          bordersStyle.rbtc = borderColor.blue;
          bordersStyle.btc = borderColor.gray;

          this.firstCircle = circleColor.blue;
          percentage = 30;
          break;
        case PegoutStatus.WAITING_FOR_CONFIRMATION:
          currentBarColor.value = colors.blue;
          bordersStyle.rbtc = borderColor.blue;
          bordersStyle.btc = borderColor.gray;

          firstCircle.value = circleColor.blue;
          secondCircle.value = circleColor.blue;
          percentage = 60;
          break;
        case PegoutStatus.RELEASE_BTC:
          currentBarColor.value = colors.green;
          bordersStyle.rbtc = borderColor.green;
          bordersStyle.btc = borderColor.green;

          firstCircle.value = circleColor.green;
          secondCircle.value = circleColor.green;
          thirdCircle.value = circleColor.green;
          percentage = 100;
          break;
        default:
          currentBarColor.value = colors.gray;
          bordersStyle.rbtc = borderColor.gray;
          bordersStyle.btc = borderColor.gray;

          firstCircle.value = circleColor.gray;
          secondCircle.value = circleColor.gray;
          thirdCircle.value = circleColor.gray;
          percentage = 0;
          break;
      }
      return percentage;
    });

    const currentStatus = computed(() => {
      return txDetails.value.status;
    });

    const showRejectedMsg = computed(() => {
      return currentStatus.value === PegoutStatus.REJECTED;
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
  }
}
</script>