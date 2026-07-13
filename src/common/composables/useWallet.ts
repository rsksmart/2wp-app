import {
  computed, reactive, watch, markRaw,
  toRaw, toRefs,
} from 'vue';
import {
  useAppKit, useAppKitAccount, useAppKitEvents, useAppKitProvider, useDisconnect, type Provider,
} from '@reown/appkit/vue';
import { ethers } from 'ethers';
import * as constants from '@/common/store/constants';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

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

interface Eip6963AnnounceProviderEvent extends Event {
  detail: {
    info: { name: string };
    provider: Provider;
  };
}

interface WalletConnectPeerMetadata {
  session?: {
    peer?: {
      metadata?: {
        name?: string;
      };
    };
  };
}

// Reads the wallet-declared name via the EIP-6963 provider discovery standard
// (https://eips.ethereum.org/EIPS/eip-6963), the same self-reported metadata
// AppKit itself sources wallet names from. Works for any EIP-6963-compliant
// wallet without needing per-wallet detection logic.
function detectAnnouncedWalletName(walletProvider: Provider): string | undefined {
  // useAppKitProvider() wraps the raw EIP-1193 provider in a Vue ref/reactive
  // proxy, so it's never reference-equal to the object EIP-6963 announces.
  // toRaw() unwraps it back to the original object for comparison.
  const rawWalletProvider = toRaw(walletProvider);
  let detectedName: string | undefined;
  const handleAnnounce = (event: Event) => {
    const { detail } = event as Eip6963AnnounceProviderEvent;
    if (detail.provider === rawWalletProvider) {
      detectedName = detail.info.name;
    }
  };
  window.addEventListener('eip6963:announceProvider', handleAnnounce);
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  window.removeEventListener('eip6963:announceProvider', handleAnnounce);
  return detectedName;
}

function detectWalletName(walletProvider: Provider): string | undefined {
  const walletConnectProvider = walletProvider as Provider & WalletConnectPeerMetadata;
  return detectAnnouncedWalletName(walletProvider)
    ?? walletConnectProvider.session?.peer?.metadata?.name;
}

export function useWallet() {
  const store = useStore();
  const router = useRouter();
  const { provider } = toRefs(state);
  const account = useAppKitAccount();
  const route = useRoute();
  const isWeb3Connected = computed(() => account.value.isConnected);
  const { open: openModal } = useAppKit();

  function setProvider() {
    return new Promise((resolve) => {
      const { walletProvider } = useAppKitProvider<Provider>('eip155');
      if (walletProvider && isWeb3Connected.value) {
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
        provider.value = markRaw(ethersProvider);
        store.dispatch(`web3Session/${constants.SESSION_CONNECT_REOWN_WEB3}`, {
          provider: provider.value,
          walletName: detectWalletName(walletProvider),
        })
          .then(resolve);
      }
    });
  }

  function connect(): Promise<void | { hash: string }> {
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
          .then(() => {
            if (route.name === 'Home') {
              router.push('/pegout');
            }
          });
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
