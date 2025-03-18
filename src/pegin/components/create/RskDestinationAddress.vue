<template>
  <v-row no-gutters class="d-flex flex-column pa-0 form">
    <span class="text-body-sm mb-4">
      Destination Address
    </span>
    <v-text-field
        class="text-body-sm flex-grow-0"
        density="comfortable"
        :class="(!isValidInputAddress && isInputFilled) && 'input-error'"
        v-model="address"
        :readonly="Boolean(connectedAccount)"
        flat
        hide-details
        rounded="lg"
        variant="solo"
        placeholder="Paste your RBTC Address">
      <template #append-inner>
        <v-btn size="small" class="text-button" @click="connectOrDisconnect">
          {{ connectedAccount ? 'Disconnect' : 'Connect Wallet' }}
        </v-btn>
      </template>
    </v-text-field>
    <v-alert v-show="isAmountFilled && !isInputFilled"
      color="orange" density="compact" variant="text" class="px-0">
      Please inform destination address
    </v-alert>
    <v-alert v-show="!isValidInputAddress && isInputFilled" type="error"
      color="orange" density="compact">
      Not an address
    </v-alert>
    <v-alert v-show="notChecksummedAddressWarning" type="warning"
      color="orange" density="compact" variant="outlined">
      Not a checksummed address
    </v-alert>
  </v-row>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useAction, useGetter } from '@/common/store/helper';
import * as rskUtils from '@rsksmart/rsk-utils';
import * as constants from '@/common/store/constants';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';

export default defineComponent({
  name: 'RskDestinationAddress',
  props: {
    isAmountFilled: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, context) {
    const connectedAccount = useGetter<string>('web3Session', constants.SESSION_GET_CHECKSUMMED_ACCOUNT);
    const address = ref(connectedAccount.value);
    const { isAddress, isValidAddress } = rskUtils;

    const CHAIN_ID = EnvironmentAccessorService.getEnvironmentVariables()
      .vueAppCoin === constants.BTC_NETWORK_MAINNET ? 30 : 31;

    const notChecksummedAddressWarning = computed(() => {
      if (isAddress(address.value)) {
        return !isValidAddress(address.value, CHAIN_ID);
      }
      return false;
    });

    const isInputFilled = computed(() => address.value !== '');
    const isValidInputAddress = computed(() => isInputFilled.value && isAddress(address.value));
    const setRskAddress = useAction('pegInTx', constants.PEGIN_TX_ADD_RSK_ADDRESS);
    const setRskAddressForFlyover = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_ROOTSTOCK_ADDRESS);

    watch(address, async () => {
      if (isValidInputAddress.value) {
        await setRskAddress(address.value);
        await setRskAddressForFlyover(address.value);
      }
      context.emit('validAddress', isValidInputAddress.value, address.value);
    });

    const clearSession = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const connectWeb3 = useAction('web3Session', constants.SESSION_CONNECT_WEB3);
    function connectOrDisconnect() {
      if (connectedAccount.value) {
        clearSession().then(() => { address.value = ''; });
      } else {
        connectWeb3().then(() => { address.value = connectedAccount.value; });
      }
    }

    if (connectedAccount.value) {
      setRskAddress(address.value);
    }

    return {
      address,
      connectedAccount,
      connectOrDisconnect,
      isValidInputAddress,
      notChecksummedAddressWarning,
      isInputFilled,
    };
  },
});
</script>
