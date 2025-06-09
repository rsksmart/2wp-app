<template>
  <v-container>
    <v-row>
        State: {{state}}
    </v-row>
    <v-row>
      AccountInfo: {{ accountInfo }}
    </v-row>
    <v-row>
      Embbeded wallet info :{{ accountInfo.embeddedWalletInfo }}
    </v-row>
    <v-row>
      Wallet Info: {{ walletInfo }}
    </v-row>
  </v-container>
</template>
<script lang="ts">
import { BitcoinConnector } from '@reown/appkit-adapter-bitcoin';
import {
  useAppKit, useAppKitAccount, useAppKitProvider, useAppKitState,
  useWalletInfo,
} from '@reown/appkit/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ReownWalletService',
  emits: ['error'],
  setup(props, { emit }) {
    const { open: openModal } = useAppKit();
    const state = useAppKitState();
    const accountInfo = useAppKitAccount();
    const walletInfo = useWalletInfo();
    const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122');

    function handleError(e: Error) {
      emit('error', e);
    }

    function connect(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (!walletProvider) {
          openModal(
            {
              namespace: 'bip122',
            },
          )
            .then(resolve)
            .catch((e) => {
              handleError(e);
              reject(e);
            });
        } else {
          const e = new Error('Reown aleready connected');
          handleError(e);
          reject(e);
        }
      });
    }

    return {
      connect,
      state,
      accountInfo,
      walletProvider,
      walletInfo,
    };
  },
});
</script>
