<template>
  <v-dialog :model-value="modelValue" @update:model-value="emitClose"
    max-width="450">
    <v-card min-height="300">
        <v-btn icon @click="emitClose" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      <v-card-title class="d-flex justify-space-between align-center ">
        <v-row class="d-flex justify-center align-center">
          <span class="font-weight-bold the-text-h5">
            Selecciona tu Wallet
          </span>
        </v-row>
      </v-card-title>

      <v-card-text class="d-flex flex-column gap-4 my-4">
        <v-col class="my-4">
          <v-row class ="d-flex justify-center mb-12 pa-6">
            <v-btn variant="text"
              @click="selectWallet(constants.WalletTypes.SOFTWARE)">
              <div class="bg-bw-400 w-100 h-100 pa-4">
                <v-icon color="off-white" :icon="mdiCellphoneLink" size="40"></v-icon>
              </div>
              <span class="mx-4 text-body-1 font-weight-bold">
                Software Wallet
              </span>
            </v-btn>
          </v-row>
          <v-row class="d-flex justify-center mt-12">
            <v-btn variant="text" @click="selectWallet(constants.WalletTypes.HARDWARE)">
              <div class="bg-bw-400 w-100 h-100 pa-4">
                <v-icon color="off-white" :icon="mdiUsbFlashDriveOutline" size="40"></v-icon>
              </div>
              <span class="mx-4 text-body-1 font-weight-bold">
                Hardware Wallet
              </span>
            </v-btn>
          </v-row>
        </v-col>
        <v-row class="mt-15 d-flex justify-center">
          <span>
            <a href="https://www.rsk.co/rbtc/" target="_blank" class="text-bw-400">Dont't have a wallet? </a>
          </span>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';
import { mdiCellphoneLink, mdiUsbFlashDriveOutline } from '@mdi/js';

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

    function selectWallet(wallet: constants.WalletTypes) {
      emitClose();
      emit('selected-wallet', wallet);
    }

    return {
      environmentContext,
      emitClose,
      selectWallet,
      constants,
      mdiCellphoneLink,
      mdiUsbFlashDriveOutline,
    };
  },
});
</script>
