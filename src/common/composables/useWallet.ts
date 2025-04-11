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

  const appKitProvider = useAppKitProvider<Provider>('eip155');
  watch(appKitProvider, () => {
    if (appKitProvider.walletProvider) {
      const ethersProvider = new ethers.providers.Web3Provider(appKitProvider.walletProvider);
      provider.value = markRaw(ethersProvider);
    } else {
      provider.value = null;
    }
  });

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
    if (events.data.event === 'CONNECT_SUCCESS') {
      setBalance()
        .then(setAddress)
        .then(() => {
          router.push('/pegout');
        });
    }
    if (events.data.event === 'DISCONNECT_SUCCESS') {
      router.push('/');
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
