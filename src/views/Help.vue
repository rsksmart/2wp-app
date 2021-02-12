<template>
  <div class="container">
    <v-btn @click="getAddress">  get address</v-btn>
    <p>
      {{data}}
    </p>
    <v-btn @click="getAccountInfo"> get account info</v-btn>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import TrezorService from '@/services/TrezorService';
import * as constants from '@/store/constants';

@Component
export default class Help extends Vue {
  trezorService: TrezorService = new TrezorService('test');

  data: object = {};

  // @State('peginTx') profile!: PegInTxState;
  //
  // @Action('fetchData', { namespace: 'profile' }) fetchData!: any;
  //
  // @Getter('fullName', { namespace: 'profile' }) fullName!: string;
  // @Emit()
  // getAddress() {
  //   this.trezorService
  //     .getAddressList(constants.BITCOIN_LEGACY_ADDRESS, 2, 0, 10)
  //     .then((addressList) => {
  //       this.data = addressList;
  //     });
  // }

  @Emit()
  getAccountInfo() {
    this.trezorService.getAccountUtxos(constants.BITCOIN_SEGWIT_ADDRESS, 0)
      .then(console.log)
      .catch(console.error);
  }
}
</script>
