<template>
  <v-dialog v-model="showAddressDialog" width="520" persistent>
    <v-card class="container dialog">
      <v-col cols="12" align-self="center" class="pt-0">
        <v-row class="mx-0 mt-4 mb-4 d-flex justify-center">
            <p class="pop-up-title">Sign this message</p>
        </v-row>
        <v-row class="mx-0 mb-10 justify-center">
            <p class="pop-up-subtitle mb-4">
              We will use the signature to get your Bitcoin destination address.
            </p>
            <p class="mb-2 p-0">
              This does not expose your data nor spend your funds.
            </p>
            <div class="pop-up-sign-field">
              {{messageToBeSigned}}
            </div>
        </v-row>
        <v-row class="mx-0 mb-10" justify="space-around">
            <v-btn width="145" height="50" density="compact" variant="outlined" rounded
            color="#000000" @click="closeDialog">
                <span class="blackish">Cancel</span>
            </v-btn>
            <v-btn width="200" height="50" dense rounded
            @click="toSign" color="#000000">
                <span class="whiteish">Sign</span>
            </v-btn>
        </v-row>
      </v-col>
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
