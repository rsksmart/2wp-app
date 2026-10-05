<template>
  <v-dialog v-model="showAddressDialog" width="520" persistent >
    <v-card class="d-flex ga-4 pa-8">
      <div class="d-flex text-h3 ga-1 flex-wrap">
            <span class='pa-2 bg-purple'>
              Sign this message
            </span>
      </div>
      <div>
        <p>
          We will use the signature to get your Bitcoin destination address.
          This does not expose your data nor spend your funds.
        </p>
      </div>
      <div class="px-4 py-2 text-bw-500 border">
        <p>{{messageToBeSigned}}</p>
      </div>
      <v-alert v-if="signatureError" type="error" variant="tonal" density="compact">
        <span class="text-body-sm">{{ signatureError }}</span>
      </v-alert>
        <div class="d-flex justify-space-around">
          <v-btn-rsk width="110" @click="closeDialog" :disabled="signing">Cancel</v-btn-rsk>
          <v-btn-rsk width="110" variant="flat" @click="toSign" :disabled="signing">
            Sign
          </v-btn-rsk>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import * as constants from '@/common/store/constants';
import { useAction } from '@/common/store/helper';
import { captureError } from '@/sentry';

export default defineComponent({
  name: 'AddressDialog',
  setup(_, context) {
    const messageToBeSigned = 'Sign this message to get your Bitcoin destination address';
    const showAddressDialog = ref(true);
    const signing = ref(false);
    const signatureError = ref('');
    const signMessage = useAction('web3Session', constants.SESSION_SIGN_MESSAGE);
    function closeDialog() {
      return context.emit('closeDialog', showAddressDialog.value);
    }
    function toSign() {
      signatureError.value = '';
      signing.value = true;
      signMessage(messageToBeSigned)
        .then(() => {
          closeDialog();
        })
        .catch((e) => {
          // The derived address is only trusted when the connected account itself signed,
          // so a rejected signature must keep the dialog open instead of failing silently.
          signatureError.value = 'We could not verify that the signature belongs to your '
            + 'connected account. Please try again with the connected wallet.';
          captureError(e, { source: constants.SESSION_SIGN_MESSAGE });
        })
        .finally(() => {
          signing.value = false;
        });
    }
    return {
      showAddressDialog,
      messageToBeSigned,
      closeDialog,
      toSign,
      signing,
      signatureError,
    };
  },
});
</script>
