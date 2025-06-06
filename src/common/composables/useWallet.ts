import {
  computed, reactive, watch, markRaw,
  toRefs,
} from 'vue';
import {
  useAppKit, useAppKitAccount, useAppKitEvents, useAppKitProvider, useDisconnect, type Provider,
} from '@reown/appkit/vue';
import { ethers } from 'ethers';
import * as constants from '@/common/store/constants';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

interface WalletSharedState {
  provider: ethers.providers.Web3Provider | null;
}

const state = reactive<WalletSharedState>({
  provider: null,
});

const enum WalletEvents {
  CONNECT_SUCCESS = 'CONNECT_SUCCESS',
  DISCONNECT_SUCCESS = 'DISCONNECT_SUCCESS',
  SELECT_WALLET = 'SELECT_WALLET',
  MODAL_CLOSE = 'MODAL_CLOSE',
}

export function useWallet() {
  const store = useStore();
  const router = useRouter();
  const { provider } = toRefs(state);
  const account = useAppKitAccount();

  const isWeb3Connected = computed(() => account.value.isConnected);
  const { open: openModal } = useAppKit();

  function setProvider() {
    return new Promise((resolve) => {
      const { walletProvider } = useAppKitProvider<Provider>('eip155');
      if (walletProvider && isWeb3Connected.value) {
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
        provider.value = markRaw(ethersProvider);
        store.dispatch(`web3Session/${constants.SESSION_CONNECT_REOWN_WEB3}`, provider.value)
          .then(resolve);
      }
    });
  }

  function connect(): Promise<void> {
    return new Promise((resolve) => {
      if (!isWeb3Connected.value) {
        openModal(
          {
            view: 'Connect',
            namespace: 'eip155',
          },
        )
          .then(resolve);
      } else {
        setProvider()
          .then(() => {
            router.push('/pegout');
            resolve();
          });
      }
    });
  }

  const events = useAppKitEvents();
  watch(events, () => {
    switch (events.data.event) {
      case WalletEvents.CONNECT_SUCCESS:
      case WalletEvents.MODAL_CLOSE:
        setProvider()
          .then(() => router.push('/pegout'));
        break;
      case WalletEvents.DISCONNECT_SUCCESS:
        provider.value = null;
        break;
      default:
        console.log('Unhandled AppKit event:', events.data.event);
        break;
    }
  });

  const { disconnect: disconnectWallet } = useDisconnect();
  function disconnect() {
    return disconnectWallet({ namespace: 'eip155' });
  }

  return {
    connect,
    disconnect,
    provider,
  };
}
