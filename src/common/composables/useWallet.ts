import {
  computed, reactive, watch, markRaw,
  toRefs,
} from 'vue';
import {
  useAppKit, useAppKitAccount, useAppKitEvents, useAppKitProvider, useDisconnect, type Provider,
} from '@reown/appkit/vue';
import { useRouter } from 'vue-router';
import { ethers } from 'ethers';
import { WeiBig } from '@/common/types';

interface WalletSharedState {
  provider: ethers.providers.Web3Provider | null;
  address: string | null;
  balance: WeiBig;
}

const state = reactive<WalletSharedState>({
  provider: null,
  address: null,
  balance: new WeiBig(0, 'wei'),
});

const enum WalletEvents {
  CONNECT_SUCCESS = 'CONNECT_SUCCESS',
  DISCONNECT_SUCCESS = 'DISCONNECT_SUCCESS',
  SELECT_WALLET = 'SELECT_WALLET',
  MODAL_CLOSE = 'MODAL_CLOSE',
}

export function useWallet() {
  const { provider, balance, address } = toRefs(state);
  const account = useAppKitAccount();
  const router = useRouter();

  const isConnected = computed(() => account.value.isConnected);
  const { open: openModal } = useAppKit();
  function connect() {
    if (!isConnected.value) {
      openModal({ view: 'Connect' });
    } else {
      router.push('/pegout');
    }
  }

  async function setBalance() {
    if (!provider.value || !account.value.address) return;

    const rawBalance = await provider.value.getBalance(account.value.address);
    const parsedBalance = new WeiBig(rawBalance.toBigInt(), 'wei');
    balance.value = parsedBalance;
  }

  function setAddress() {
    if (account.value.address) {
      address.value = account.value.address;
    }
  }

  const events = useAppKitEvents();
  watch(events, () => {
    const { walletProvider } = useAppKitProvider<Provider>('eip155');
    switch (events.data.event) {
      case WalletEvents.CONNECT_SUCCESS:
      case WalletEvents.MODAL_CLOSE:
        if (walletProvider) {
          const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
          provider.value = markRaw(ethersProvider);
        }
        setBalance()
          .then(setAddress)
          .then(() => {
            router.push('/pegout');
          });
        break;
      case WalletEvents.DISCONNECT_SUCCESS:
        provider.value = null;
        router?.push('/');
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
    address,
    connect,
    disconnect,
    provider,
    balance,
  };
}
