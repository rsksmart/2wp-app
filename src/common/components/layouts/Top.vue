<template>
  <header class="d-flex justify-space-between align-center py-4 px-8">
    <div class="d-flex align-start ga-2">
      <v-img inline width="160" alt="Rootstock logo" class="cursor-pointer"
        :src="getLogoSrc()" @click="goHome">
      </v-img>
      <v-container>
        <v-row class="py-1">
          <h1 class="text-purple text-h6">2 Way Peg</h1>
        </v-row>
        <v-row justify="end">
          <v-chip class="" variant="flat" color="purple" density="compact" >
            {{ environmentText }}
          </v-chip>
        </v-row>
      </v-container>
    </div>
    <div class="d-flex align-center ga-5">
      <div class="d-flex align-center ga-2" v-if="truncatedAccount && accountBalance">
        <v-btn variant="text" size="small" density="compact" rounded="full" :icon="mdiContentCopy"
          @click="copyFullAccountAddress"
        />
        <span>{{ truncatedAccount }} | {{ accountBalance }} </span>
        <v-btn variant="flat" size="x-small" color="theme-primary" rounded="full" :icon="mdiLinkOff"
          @click="disconnectWallet" />
      </div>
      <label for="theme" class="theme-switch">
        <input id="theme" type="checkbox" v-model="themeLight">
        <span class="slider"></span>
      </label>
    </div>
  </header>
</template>

<script lang="ts">
import { useAction, useStateAttribute } from '@/common/store/helper';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { mdiContentCopy, mdiLinkOff } from '@mdi/js';
import * as constants from '@/common/store/constants';
import { computed, ref, watch } from 'vue';
import { truncateString } from '@/common/utils';
import { WeiBig } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default {
  name: 'TopBar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const themeLight = ref(false);
    const vuetifyTheme = useTheme();
    function goHome() {
      if (route.name !== 'Home') router.push({ name: 'Home' });
    }

    function getLogoSrc() {
      return vuetifyTheme.global.current.value.dark ? require('@/assets/logo-rootstock-white.svg') : require('@/assets/logo-rootstock-black.svg');
    }

    const account = useStateAttribute<string>('web3Session', 'account');
    const truncatedAccount = computed(() => truncateString(account.value));

    const balance = useStateAttribute<WeiBig>('web3Session', 'balance');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const accountBalance = computed(() => {
      const amount = balance.value.toRBTCTrimmedString().slice(0, 7);
      return `${amount} ${environmentContext.getRbtcTicker()}`;
    });
    const environmentText = environmentContext.getNetworkName();

    const clearSession = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    function disconnectWallet() {
      clearSession();
      router.push({ name: 'Home' });
    }

    function copyFullAccountAddress() {
      navigator.clipboard.writeText(account.value);
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
      environmentText,
    };
  },
};
</script>
<style scoped>
.v-btn--icon.bg-purple {
  color: #fff !important;
}
</style>
