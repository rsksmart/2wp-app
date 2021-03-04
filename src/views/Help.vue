<template>
  <div class="container">
    <send-bitcoin-form :balances="balances" :btcUnusedAddresses="addresses"
                       :bitcoinWallet="bitcoinWallet"/>
<!--    <v-btn @click="getAccountAddresses">get addresses</v-btn>-->
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import TrezorService from '@/services/TrezorService';
import SendBitcoinForm from '@/components/exchange/SendBitcoinForm.vue';
import { UnusedWalletAddress } from '@/store/peginTx/types';
import * as constants from '@/store/constants';

@Component({
  components: {
    SendBitcoinForm,
  },
})
export default class Help extends Vue {
  trezorService: TrezorService = new TrezorService('test');

  addresses: UnusedWalletAddress[] = [];

  bitcoinWallet = 'WALLET_TREZOR';

  balances = {
    "segwit": 50000,
    "nativeSegwit": 49997000,
    "legacy": 3289478
  };

  address = [{"path":[2147483692,2147483649,2147483648,0,0],"serializedPath":"m/44'/1'/0'/0/0","address":"mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1"},{"path":[2147483692,2147483649,2147483648,1,0],"serializedPath":"m/44'/1'/0'/1/0","address":"mqCjBpQ75Y5sSGzFtJtSQQZqhJze9eaKjV"},{"path":[2147483697,2147483649,2147483648,0,0],"serializedPath":"m/49'/1'/0'/0/0","address":"2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs"},{"path":[2147483697,2147483649,2147483648,1,0],"serializedPath":"m/49'/1'/0'/1/0","address":"2NCZ2CNYiz4rrHq3miUHerUMcLyeWU4gw9C"},{"path":[2147483732,2147483649,2147483648,0,0],"serializedPath":"m/84'/1'/0'/0/0","address":"tb1qtanvhhl8ve32tcdxkrsamyy6vq5p62ctdv89l0"},{"path":[2147483732,2147483649,2147483648,1,0],"serializedPath":"m/84'/1'/0'/1/0","address":"tb1qfuk3j0l4qn4uzstc47uwk68kedmjwuucl7avqr"},{"path":[2147483692,2147483649,2147483648,0,1],"serializedPath":"m/44'/1'/0'/0/1","address":"mu3fMm1zoMYt8LureScmXMSbMNE2nqx7dA"},{"path":[2147483692,2147483649,2147483648,1,1],"serializedPath":"m/44'/1'/0'/1/1","address":"n1CfunLraRXEUgq6qFeekgHMhim9hMXZH7"},{"path":[2147483697,2147483649,2147483648,0,1],"serializedPath":"m/49'/1'/0'/0/1","address":"2N1PDkBbjeampkMVSNm5oxj6bR1f9BCZaXU"},{"path":[2147483697,2147483649,2147483648,1,1],"serializedPath":"m/49'/1'/0'/1/1","address":"2N3MwqmCeEiggLDrUeSmD4D384JNrieoXBV"},{"path":[2147483732,2147483649,2147483648,0,1],"serializedPath":"m/84'/1'/0'/0/1","address":"tb1q2990uulszda0g2qwluw3ry22cs452lpfaty965"},{"path":[2147483732,2147483649,2147483648,1,1],"serializedPath":"m/84'/1'/0'/1/1","address":"tb1qymmqueltl38pz7zye5nqygwlvcy43ay4euj394"}],

  @Emit()
  getAccountAddresses() {
    this.trezorService.getAccountUnusedAddresses(constants.BITCOIN_SEGWIT_ADDRESS)
      .then((addresses) => {
        console.log(addresses);
      })
      .catch(console.error);
  }
}
</script>
