<template>
  <div class="transactions">
    <v-row class="mx-0 my-8 d-flex justify-center">
      <h1 class="text-center ma-0">
        Your transaction was successfully sent!
      </h1>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <span class="text-center">
        Take note of the transaction id shown below, it will be useful for you to check the status
        of the process
      </span>
    </v-row>
    <v-row id="tx-id-box" justify="center" class="mx-0">
      <v-col class="tracking-box">
        <div class="mx-0 box">
          <v-container>
            <v-row class="mx-0" justify="center">
              <v-col cols="10" class="d-flex flex-column align-start" >
                <v-row class="mx-0 mb-1">
                  <h3>Transaction id:</h3>
                </v-row>
                <v-row class="mx-0 mb-2 ml-2">
                  <span>{{ txId }}</span>
                </v-row>
              </v-col>
              <v-col cols="2" class="d-flex flex-column align-end">
                <v-btn icon @click="copyTxId">
                  <v-img src="@/assets/wallet-icons/copy.png" height="24" width="22" contain/>
                </v-btn>
              </v-col>
            </v-row>
            <v-divider  color="#C4C4C4"/>
            <v-row class="mx-0">
              <v-col>
                <v-row class="mx-0 mb-1">
                  <h3>Transaction link: </h3>
                </v-row>
                <v-row class="mx-0 mb-2 ml-2">
                  <a class="listTitle" target="_blank" :href="btcExplorerUrl">
                    {{ chunkedBtcExplorerUrl }}
                  </a>
                </v-row>
              </v-col>
              <v-col cols="2" class="d-flex justify-end">
                <v-btn icon @click="copyUrl">
                  <v-img src="@/assets/wallet-icons/copy.png" height="24" width="22" contain/>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </div>
        <v-row class="mx-0 my-5 d-flex justify-center dialog">
          <v-btn rounded class="big_button" color="#000000" @click="toTxStatus">
            <span class="whiteish">Go to status page</span>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Emit,
  Vue,
} from 'vue-property-decorator';
import { getBtcTxExplorerUrl } from '@/services/utils';

@Component
export default class Success extends Vue {
  email = '';

  txId = '';

  get btcExplorerUrl() {
    return getBtcTxExplorerUrl(this.txId);
  }

  get chunkedBtcExplorerUrl() {
    return `${this.btcExplorerUrl.substr(0, 30)}...${this.btcExplorerUrl.substr(104, 108)}`;
  }

  get chunkedTxId() {
    return `${this.txId.substr(0, 30)}...${this.txId.substr(60, 64)}`;
  }

  @Emit()
  toTxStatus() {
    this.$router.push({ name: 'Status', params: { txId: this.txId } });
  }

  @Emit()
  copyUrl() {
    navigator.clipboard.writeText(this.btcExplorerUrl);
  }

  @Emit()
  copyTxId() {
    navigator.clipboard.writeText(this.txId);
  }

  created() {
    this.txId = this.$route.params.txId;
  }
}
</script>
