<template>
  <header class="d-flex justify-space-between align-center py-4 px-8">
    <div class="d-flex align-center ga-2">
      <v-img inline width="160" alt="Rootstock logo" class="cursor-pointer"
        :src="getLogoSrc()" @click="goHome">
      </v-img>
      <h1 class="text-purple text-h5">2 Way Peg</h1>
    </div>
    <div class="d-flex align-center ga-5">
      <div class="d-flex align-center ga-2" v-if="truncatedAccount">
        <v-btn variant="text" size="small" density="compact" rounded="full" :icon="mdiContentCopy"
          @click="copyFullAccountAddress"
        />
        <span>{{ truncatedAccount }}</span>
        <v-btn variant="flat" size="x-small" color="purple" rounded="full" :icon="mdiLinkOff"
          @click="disconnectWallet" />
      </div>
      <v-switch inset hide-details base-color="purple" @click="toggleTheme" />
    </div>
  </header>
</template>

<script lang="ts">
import { useAction, useStateAttribute } from '@/common/store/helper';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { mdiContentCopy, mdiLinkOff } from '@mdi/js';
import * as constants from '@/common/store/constants';
import { computed } from 'vue';
import { truncateString } from '@/common/utils';

export default {
  name: 'TopBar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    function goHome() {
      if (route.name !== 'Home') router.push({ name: 'Home' });
    }

    const { global: { current, name } } = useTheme();
    function toggleTheme() {
      name.value = current.value.dark ? 'light' : 'dark';
    }
    function getLogoSrc() {
      return current.value.dark ? require('@/assets/logo-rootstock-white.svg') : require('@/assets/logo-rootstock-black.svg');
    }

    const account = useStateAttribute<string>('web3Session', 'account');
    const truncatedAccount = computed(() => truncateString(account.value));

    const clearSession = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    function disconnectWallet() {
      clearSession();
      router.push({ name: 'Home' });
    }

    function copyFullAccountAddress() {
      navigator.clipboard.writeText(account.value);
    }

    return {
      goHome,
      toggleTheme,
      getLogoSrc,
      truncatedAccount,
      disconnectWallet,
      mdiLinkOff,
      mdiContentCopy,
      copyFullAccountAddress,
    };
  },
};
</script>
<style scoped>
.v-btn--icon.bg-purple {
  color: #fff !important;
}
</style>
