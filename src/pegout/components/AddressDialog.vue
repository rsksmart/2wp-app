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
        <div class="d-flex justify-space-around">
          <v-btn-rsk width="110" @click="closeDialog">Cancel</v-btn-rsk>
          <v-btn-rsk width="110" variant="flat" @click="toSign">Sign</v-btn-rsk>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import * as constants from '@/common/store/constants';
import { useAction } from '@/common/store/helper';

export default defineComponent({
  name: 'AddressDialog',
  setup(_, context) {
    const messageToBeSigned = 'Sign this message to get your Bitcoin destination address';
    const showAddressDialog = ref(true);
    const signMessage = useAction('web3Session', constants.SESSION_SIGN_MESSAGE);
    function closeDialog() {
      return context.emit('closeDialog', showAddressDialog.value);
    }
    function toSign() {
      signMessage(messageToBeSigned)
        .then(() => {
          closeDialog();
        });
    }
    return {
      showAddressDialog,
      messageToBeSigned,
      closeDialog,
      toSign,
    };
  },
});
</script>
