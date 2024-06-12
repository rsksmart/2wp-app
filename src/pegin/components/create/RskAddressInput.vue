<template>
<v-col class="pl-0">
  <span>Destination Address</span>
  <v-row class="my-2">
    <v-combobox
      variant="solo" flat rounded="lg" hide-details
      hide-selected
      no-filter
      v-model="selectedAddress"
      density="compact"
      placeholder="Select the address"
      :persistent-placeholder="false"
      :items="addressItems"
      @update:model-value="checkStep"
      type="text"
      >
  </v-combobox>
  </v-row>
  <v-row class="my-0" v-if="state.matches(['invalid'])">
    <v-col align-self="start" class="pa-0">
      <v-alert :text="validAddressMessage" class="pa-2"
          type="warning" color="alert">
        </v-alert>
    </v-col>
  </v-row>
</v-col>
</template>

<script lang="ts">
import * as rskUtils from '@rsksmart/rsk-utils';
import {
  computed, ref, defineComponent, watch,
} from 'vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useStateAttribute } from '@/common/store/helper';
import { Machine, getChunkedValue } from '@/common/utils';

interface AddressItem {
  title: string;
  value: string;
  id: number;
}

export default defineComponent({
  name: 'RskAddressInput',
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const useWeb3Wallet = ref(false);
    const web3Wallet = ref(false);
    const CHAIN_ID = EnvironmentAccessorService
      .getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? 30 : 31;
    const VALUE_INCOMPLETE_MESSAGE = 'Not completed';
    const rskAddressSelected = ref('');
    const state = ref(new Machine<'unset' | 'valid' | 'invalid'>('unset'));

    const account = useStateAttribute<string>('web3Session', 'account');
    const storeRskAddressSelected = useStateAttribute<string>('pegInTx', 'rskAddressSelected');
    const setRskAddress = useAction('pegInTx', constants.PEGIN_TX_ADD_RSK_ADDRESS);

    const web3Address = computed(() => account.value ?? '');

    const addressItems: AddressItem[] = [
      {
        title: `Connected wallet (${getChunkedValue(account.value, 9)})`,
        value: account.value,
        id: 0,
      },
      {
        title: 'Input custom address',
        value: '',
        id: 1,
      },
    ];

    const selectedAddress = ref<string | AddressItem>();

    const computedRskAddress = computed<string>((): string => {
      let address = '';
      if (!selectedAddress.value) return address;
      if (typeof selectedAddress.value === 'string'
        && selectedAddress.value !== '') {
        address = selectedAddress.value;
      }
      if (typeof selectedAddress.value === 'object') {
        address = selectedAddress.value.value;
      }
      return address;
    });

    const isConnectedWallet = computed<boolean>(() => typeof selectedAddress.value === 'object' && selectedAddress.value.id === 1);

    watch(selectedAddress, (newValue) => {
      const value = newValue as AddressItem;
      if (!value) return;
      if (isConnectedWallet.value) {
        selectedAddress.value = '';
        setRskAddress('');
      }
    });

    const isValidRskAddress = computed(
      () => (rskUtils.isValidChecksumAddress(computedRskAddress.value, CHAIN_ID)),
    );

    const isValidPegInAddress = computed(
      () => rskUtils.isAddress(computedRskAddress.value, CHAIN_ID)
            && computedRskAddress.value.startsWith('0x'),
    );

    const isValidCheckSum = computed(() => (
      rskUtils.toChecksumAddress(computedRskAddress.value, CHAIN_ID)
      === computedRskAddress.value));

    function validateAddress() {
      return rskUtils.isAddress(computedRskAddress.value);
    }

    function checkStep() {
      if (computedRskAddress.value === '') {
        state.value.send('unset');
        setRskAddress('');
      } else if (!isValidPegInAddress.value) {
        setRskAddress('');
        state.value.send('invalid');
      } else {
        state.value.send('valid');
        setRskAddress(computedRskAddress.value);
      }
      context.emit('state', state);
    }

    const validAddressMessage = computed(() => {
      let message = '';
      const errorMessage = 'Please double check your RSK address before you continue';
      if (!validateAddress()
      || (!isValidPegInAddress.value)
      || (!isValidRskAddress.value || !isValidCheckSum.value)) message = errorMessage;
      checkStep();
      return message;
    });

    if (storeRskAddressSelected.value) {
      useWeb3Wallet.value = true;
      focus.value = false;
      rskAddressSelected.value = storeRskAddressSelected.value;
      [selectedAddress.value] = addressItems;
      checkStep();
    }

    return {
      environmentContext,
      focus,
      useWeb3Wallet,
      web3Wallet,
      rskAddressSelected,
      VALUE_INCOMPLETE_MESSAGE,
      CHAIN_ID,
      web3Address,
      isValidRskAddress,
      isValidPegInAddress,
      validAddressMessage,
      checkStep,
      addressItems,
      selectedAddress,
      computedRskAddress,
      state,
      isConnectedWallet,
    };
  },
});
</script>
