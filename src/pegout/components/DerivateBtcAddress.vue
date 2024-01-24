<template>
  <div class="form-step py-4">
    <v-row class="ma-0 align-start">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
        'number-filled' : 'number']">3</div>
      </v-col>
      <v-col class="pl-0 ma-0 pb-0">
        <p v-bind:class="{'boldie': focus}">
          (Optional) Verify your Bitcoin destination address:
        </p>
        <v-row class="ma-0 mt-4 pa-0">
          <v-col v-if="session.btcDerivedAddress" cols="7" class="p-0">
            <div class="container">
              <v-row class="mx-0">
                <span>Destination address</span>
              </v-row>
              <v-row class="mx-0 d-flex align-center">
                <p class="mb-0 account">
                  {{session.btcDerivedAddress}}
                </p>
              </v-row>
            </div>
          </v-col>
          <v-col v-else cols="5" class="pb-0 px-0">
            <v-row class="derive-button mx-0 d-flex justify-center">
              <v-btn :disabled="!isReadyToSign || !authorizedWalletToSignMessage"
                outlined rounded id="derivation-addr-btn"
                width="100%" height="38"
                @click="openAddressDialog" >
                <span>
                  Get Bitcoin destination address
                </span>
              </v-btn>
            </v-row>
          </v-col>
          <v-container v-if="!authorizedWalletToSignMessage"
            class="pl-0">
            <span class="blackish" style="font-size: 14px;">
              As you are not using MetaMask, Ledger or Trezor, you need to follow
              <a :href=constants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL
                  class="d-inline blackish a"
                  target='_blank'> this documentation</a> to get the destination address.
            </span>
          </v-container>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { useState } from '@/common/store/helper';
import { defineComponent, ref } from 'vue';
import { SessionState } from '@/common/types/session';
import * as constants from '@/common/store/constants';

export default defineComponent({
  name: 'DerivateBtcAddress',
  props: {
    isReadyToSign: {
      type: Boolean,
      required: true,
    },
    authorizedWalletToSignMessage: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, context) {
    const session = useState<SessionState>('web3Session');
    const focus = ref(false);

    function openAddressDialog() {
      context.emit('openAddressDialog');
    }

    return {
      focus,
      session,
      constants,
      openAddressDialog,
    };
  },
});
</script>
