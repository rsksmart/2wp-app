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
import {
  Component,
  Vue,
} from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import * as constants from '@/common/store/constants';
import { TxStatus, PegoutStatus } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

@Component({})
export default class PegoutProgressBar extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  colors = {
    blue: '#3D7DA1',
    gray: '#8c8c8c',
    green: '#9CE07B',
    yellow: '#F6C61B',
  };

  circleColor = {
    blue: 'circle-blue',
    gray: 'circle-gray',
    green: 'circle-green',
    yellow: 'circle-yellow',
  };

  borderColor = {
    blue: 'icon-status-border-blue',
    gray: 'icon-status-border-gray',
    green: 'icon-status-border-green',
    yellow: 'icon-status-border-yellow',
  };

  currentBarColor = this.colors.gray;

  firstCircle = this.circleColor.gray;

  secondCircle = this.circleColor.gray;

  thirdCircle = this.circleColor.gray;

  bordersStyle = {
    btc: this.borderColor.gray,
    rbtc: this.borderColor.gray,
  };

  @State('status') txStatus!: TxStatus;

  @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;

  get percentage() {
    let percentage;
    switch (this.txStatus.txDetails?.status) {
      case PegoutStatus.REJECTED:
        this.currentBarColor = this.colors.yellow;
        this.bordersStyle.rbtc = this.borderColor.yellow;
        this.bordersStyle.btc = this.borderColor.gray;

        this.firstCircle = this.circleColor.yellow;
        percentage = 15;
        break;
      case PegoutStatus.WAITING_FOR_SIGNATURE:
        this.currentBarColor = this.colors.blue;
        this.bordersStyle.rbtc = this.borderColor.blue;
        this.bordersStyle.btc = this.borderColor.gray;

        this.firstCircle = this.circleColor.blue;
        this.secondCircle = this.circleColor.blue;
        this.thirdCircle = this.circleColor.blue;
        percentage = 90;
        break;
      case PegoutStatus.RECEIVED:
        this.currentBarColor = this.colors.blue;
        this.bordersStyle.rbtc = this.borderColor.blue;
        this.bordersStyle.btc = this.borderColor.gray;

        this.firstCircle = this.circleColor.blue;
        percentage = 30;
        break;
      case PegoutStatus.WAITING_FOR_CONFIRMATION:
        this.currentBarColor = this.colors.blue;
        this.bordersStyle.rbtc = this.borderColor.blue;
        this.bordersStyle.btc = this.borderColor.gray;

        this.firstCircle = this.circleColor.blue;
        this.secondCircle = this.circleColor.blue;
        percentage = 60;
        break;
      case PegoutStatus.RELEASE_BTC:
        this.currentBarColor = this.colors.green;
        this.bordersStyle.rbtc = this.borderColor.green;
        this.bordersStyle.btc = this.borderColor.green;

        this.firstCircle = this.circleColor.green;
        this.secondCircle = this.circleColor.green;
        this.thirdCircle = this.circleColor.green;
        percentage = 100;
        break;
      default:
        this.currentBarColor = this.colors.gray;
        this.bordersStyle.rbtc = this.borderColor.gray;
        this.bordersStyle.btc = this.borderColor.gray;

        this.firstCircle = this.circleColor.gray;
        this.secondCircle = this.circleColor.gray;
        this.thirdCircle = this.circleColor.gray;
        percentage = 0;
        break;
    }
    return percentage;
  }

  get currentStatus() {
    return this.txStatus.txDetails?.status;
  }

  get showRejectedMsg() {
    return this.currentStatus === PegoutStatus.REJECTED;
  }
}
</script>
