<template>
  <div class="transactions">
    <v-row class="mx-0 my-8 d-flex justify-center">
      <h1 class="text-center ma-0">
        Copy the tracking ID
        <br>
        to check your transaction status
      </h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <span class="text-center">Remember to copy any of the links shown on your clipboard</span>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="3"/>
      <v-col cols="6" class="">
        <div class="mx-0 box">
          <div class="container">
            <v-row class="mx-0">
              <v-col>
                <v-row class="mx-0">
                  <h3>Transaction ID:</h3>
                </v-row>
                <v-row class="mx-0">
                  <span>{{ chunkedTxId }}</span>
                </v-row>
              </v-col>
              <v-col cols="2" class="d-flex justify-end">
                <v-btn icon @click="copyTxId">
                  <v-img src="@/assets/wallet-icons/copy.png" height="24" contain/>
                </v-btn>
              </v-col>
            </v-row>
            <v-divider  color="#C4C4C4"/>
            <v-row class="mx-0">
              <v-col>
                <v-row class="mx-0">
                  <h3>Transaction link: </h3>
                </v-row>
                <v-row class="mx-0">
                  <a class="listTitle" target="_blank" :href="btcExplorerUrl">
                    {{ chunkedBtcExplorerUrl }}
                  </a>
                </v-row>
              </v-col>
              <v-col cols="2" class="d-flex justify-end">
                <v-btn icon @click="copyUrl">
                  <v-img src="@/assets/wallet-icons/copy.png" height="24" contain/>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>
        <v-row class="mx-0 my-5 d-flex justify-center dialog">
          <v-btn class="button" color="#126DF2" @click="toTxStatus">
            <span class="whiteish">Continue</span>
          </v-btn>
        </v-row>
      </v-col>
      <v-col cols="3"/>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Emit,
  Vue,
} from 'vue-property-decorator';

@Component
export default class TrackingId extends Vue {
  email = '';

  @Prop() txId!: string;

  get btcExplorerUrl() {
    return `https://live.blockcypher.com/btc-testnet/tx/${this.txId}`;
  }

  get chunkedBtcExplorerUrl() {
    return `${this.btcExplorerUrl.substr(0, 30)}...${this.btcExplorerUrl.substr(104, 108)}`;
  }

  get chunkedTxId() {
    return `${this.txId.substr(0, 30)}...${this.txId.substr(60, 64)}`;
  }

  @Emit()
  toTxStatus() {
    this.$router.push({ name: 'Status.vue' });
  }

  @Emit()
  copyUrl() {
    navigator.clipboard.writeText(this.btcExplorerUrl);
  }

  @Emit()
  copyTxId() {
    navigator.clipboard.writeText(this.txId);
  }
}
</script>
