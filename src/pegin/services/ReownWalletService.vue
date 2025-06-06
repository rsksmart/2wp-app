<template>
  <div>
    <v-row>
        {{state}}
    </v-row>
    <v-row>
      {{ accountInfo }}
    </v-row>
  </div>
</template>
<script lang="ts">
import { BitcoinConnector } from '@reown/appkit-adapter-bitcoin';
import {
  useAppKit, useAppKitAccount, useAppKitProvider, useAppKitState, useDisconnect,
} from '@reown/appkit/vue';
import { defineComponent, watch } from 'vue';

export default defineComponent({
  name: 'ReownWalletService',
  props: {
    connectTrigger: {
      type: Boolean,
      required: true,
    },
    disconnect: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['error'],
  setup(props, { emit }) {
    const { open: openModal } = useAppKit();
    const state = useAppKitState();
    const accountInfo = useAppKitAccount();
    const { walletProvider } = useAppKitProvider<BitcoinConnector>('bip122');
    const { disconnect: disconnectWallet } = useDisconnect();

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

    async function getAccountAddresses(): Promise<void> {
      if (!walletProvider) await connect();
      const addresses = await walletProvider?.getAccountAddresses();
      console.log(addresses);
    }

    function disconnectBtc() {
      return disconnectWallet({ namespace: 'bip122' });
    }

    watch(() => accountInfo.value.isConnected, () => {
      if (accountInfo.value.isConnected) {
        console.log('Reown connected');
        console.log(accountInfo.value.address);
        console.log(accountInfo.value.allAccounts);
        console.log(accountInfo.value.embeddedWalletInfo);
      }
    }, { immediate: true });

    watch(
      () => props.connectTrigger,
      (newVal) => {
        if (newVal) {
          connect()
            .then(() => getAccountAddresses());
        }
      },
    );
    watch(
      () => props.disconnect,
      (newVal) => {
        if (newVal) {
          disconnectBtc()
            .catch(handleError);
        }
      },
    );

    return {
      connect,
      state,
      accountInfo,
    };
  },
});
</script>
