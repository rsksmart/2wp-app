<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <v-col class="exchange-form px-0">
      <v-row class="mx-0">
        <v-col cols="1" class="pa-0 d-flex align-center">
          <v-img position="center left"
                 src="@/assets/exchange/arrow.png" height="40" contain/>
        </v-col>
        <v-col class="px-0">
          <h1 class="text-left">Send Bitcoins. Get RBTC.</h1>
        </v-col>
      </v-row>
      <v-row class="mx-0 mt-2">
        <v-col id="options-col" cols="8" lg="7" class="pa-0">
          <peg-in-account-select @accountChanged="accountSelected"/>
          <v-divider color="#C4C4C4"/>

        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';
import PegInAccountSelect from '@/components/create/PegInAccountSelect.vue';
import { BtcAccount } from '@/store/peginTx/types';

@Component({
  components: { PegInAccountSelect },
})
export default class BitcoinForm extends Vue {
  @Emit()
  // eslint-disable-next-line class-methods-use-this
  accountSelected(account: BtcAccount) {
    console.log(account);
  }
}
</script>
