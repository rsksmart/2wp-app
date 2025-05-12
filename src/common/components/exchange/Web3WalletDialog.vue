<template>
  <v-dialog v-model="show" width="470" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-3 mb-3 d-flex justify-center">
        <h2>Select your wallet type</h2>
      </v-row>
      <v-row>
        <v-col>
          <v-btn>
            Hardware Wallet
          </v-btn>
        </v-col>
        <v-col>
          <v-btn>
            Software Wallet
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default defineComponent({
  name: 'Web3WalletDialog',
  props: {
    showDialog: Boolean,
  },
  setup(props, context) {
    const show = ref(props.showDialog);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    function send() {
      context.emit('continue', props.showDialog);
    }

    function cancel() {
      context.emit('cancel', props.showDialog);
    }

    return {
      environmentContext,
      send,
      cancel,
      show,
    };
  },
});
</script>
