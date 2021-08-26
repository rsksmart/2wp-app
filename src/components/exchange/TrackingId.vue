<template>
  <div class="transactions">
    <v-row class="mx-0 my-8 d-flex justify-center">
      <h1 class="text-center ma-0">
        Your transaction was successfully sent!
      </h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <span class="text-center">
        Take note of the transaction ID shown below, it will be useful for you to check the status
        of the process
      </span>
    </v-row>
    <v-row id="tx-id-box" class="mx-0">
      <v-col offset-sm="0" sm="12" offset-md="2" md="8" offset-lg="3" lg="6" offset-xl="4" xl="4">
        <div class="mx-0 box">
          <v-container>
            <v-row class="mx-0" justify="center">
              <v-col cols="10" class="d-flex flex-column align-start" >
                <v-row class="mx-0 mb-1">
                  <h3>Transaction ID:</h3>
                </v-row>
                <v-row class="mx-0">
                  <span>{{ txId }}</span>
                </v-row>
              </v-col>
              <v-col cols="2" class="d-flex flex-column align-end">
                <v-btn icon @click="copyTxId">
                  <v-img src="@/assets/wallet-icons/copy.png" height="24" contain/>
                </v-btn>
              </v-col>
            </v-row>
            <v-divider  color="#C4C4C4"/>
            <v-row class="mx-0">
              <v-col>
                <v-row class="mx-0 mb-1">
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
          </v-container>
        </div>
        <v-row class="mx-0 my-5 d-flex justify-center dialog">
          <v-btn class="button" color="#126DF2" @click="toTxStatus">
            <span class="whiteish">Done</span>
          </v-btn>
        </v-row>
      </v-col>
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
