<template>
  <header class="d-flex justify-space-between align-center py-4 px-8">
    <div class="d-flex align-center ga-2">
      <v-img inline width="160" alt="Rootstock logo" class="cursor-pointer"
             :src="getLogoSrc()" @click="goHome">
      </v-img>
      <h1 class="text-purple text-h5">PowPeg</h1>
    </div>
    <div class="d-flex align-center ga-5">
      <peg-in-account-select v-if="isPeginSelected && walletDataReady"/>
      <div class="d-flex align-center ga-2" v-else-if="truncatedAccount && accountBalance">
        <v-btn variant="text" size="small" density="compact" rounded="full" :icon="mdiContentCopy"
          @click="copyFullAccountAddress"
        />
        <span>
          {{ truncatedAccount }} | {{ accountBalance }}
          <v-tooltip
            activator="parent"
            location="bottom"
          >{{ balance.toRBTCString() }} {{ environmentContext.getRbtcTicker() }}
          </v-tooltip>
        </span>
        <v-btn variant="flat" size="x-small" color="theme-primary" rounded="full" :icon="mdiLinkOff"
          @click="disconnectWallet" />
      </div>
      <label for="theme" class="theme-switch">
        <input id="theme" type="checkbox" v-model="themeLight">
        <span class="slider"></span>
      </label>
    </div>
    <v-btn @click="displayUtxoSelector">select Utxos</v-btn>
    <uxto-selector :show-dialog="showUtxoDialog"/>
  </header>
</template>

<script lang="ts">
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import {
  mdiContentCopy, mdiLinkOff,
} from '@mdi/js';
import PegInAccountSelect from '@/pegin/components/create/PegInAccountSelect.vue';
import UxtoSelector from '@/common/components/layouts/UxtoSelector.vue';
import * as constants from '@/common/store/constants';
import { computed, ref, watch } from 'vue';
import { truncateString } from '@/common/utils';
import { WeiBig } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default {
  name: 'TopBar',
  components: {
    PegInAccountSelect,
    UxtoSelector,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const themeLight = ref(false);
    const vuetifyTheme = useTheme();
    const showUtxoDialog = ref(false);

    const account = useGetter<string>('web3Session', constants.SESSION_GET_CHECKSUMMED_ACCOUNT);
    const truncatedAccount = computed(() => truncateString(account.value));

    const balance = useStateAttribute<WeiBig>('web3Session', 'balance');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const walletDataReady = useStateAttribute<boolean>('pegInTx', 'walletDataReady');

    const accountBalance = computed(() => {
      const amount = balance.value.toRBTCString().slice(0, 7);
      return `${amount} ${environmentContext.getRbtcTicker()}`;
    });

    const clearSession = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);

    function disconnectWallet() {
      clearSession();
      router.push({ name: 'Home' });
    }

    function copyFullAccountAddress() {
      navigator.clipboard.writeText(account.value);
    }

    function goHome() {
      if (route.name !== 'Home') router.push({ name: 'Home' });
    }

    function getLogoSrc() {
      return vuetifyTheme.global.current.value.dark ? require('@/assets/logo-rootstock-white.svg') : require('@/assets/logo-rootstock-black.svg');
    }

    function displayUtxoSelector() {
      showUtxoDialog.value = !showUtxoDialog.value;
    }

    watch(themeLight, (enabledLight) => {
      vuetifyTheme.global.name.value = enabledLight ? 'light' : 'dark';
    });

    return {
      goHome,
      getLogoSrc,
      truncatedAccount,
      disconnectWallet,
      mdiLinkOff,
      mdiContentCopy,
      copyFullAccountAddress,
      themeLight,
      accountBalance,
      balance,
      environmentContext,
      isPeginSelected: computed(() => route.name === 'Create'),
      walletDataReady,
      displayUtxoSelector,
      showUtxoDialog,
    };
  },
};
</script>
<style scoped>
.v-btn--icon.bg-purple {
  color: #fff !important;
}
</style>
