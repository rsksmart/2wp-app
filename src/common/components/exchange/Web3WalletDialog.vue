<template>
  <v-dialog :model-value="modelValue" @update:model-value="emitClose" max-width="400">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        Selecciona tu Wallet
        <v-btn icon @click="emitClose" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="d-flex flex-column gap-4">
        <v-btn color="success" @click="selectWallet(constants.WalletTypes.HARDWARE)">
          Hardware Wallet
        </v-btn>
        <v-btn color="info" @click="selectWallet(constants.WalletTypes.SOFTWARE)">
          Software Wallet</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';

export default defineComponent({
  name: 'Web3WalletDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    function emitClose() {
      emit('update:modelValue', false);
    }

    function selectWallet(wallet: string) {
      emitClose();
      emit('selected-wallet', wallet);
    }

    return {
      environmentContext,
      emitClose,
      selectWallet,
      constants,
    };
  },
});
</script>
