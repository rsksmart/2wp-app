<template>
  <v-footer class="bg-background text-caption d-flex justify-space-between px-8 pb-4 pt-16">
    <div>
      <div class="d-flex align-baseline ga-1">
        <span>Built by</span>
        <v-img inline :src="getLogoSrc()" alt="RootstockLabs logo" width="100" />
      </div>
      <p class="text-bw-500 pt-1">
        Copyright © {{ currentYear }} RootstockLabs All rights reserved
      </p>
    </div>
    <div class="d-flex ga-4">
      <a href="https://rootstocklabs.com/" target="_blank">
        About RootstockLabs
      </a>
      <a :href="helpUrl" target="_blank">Help</a>
      <a :href="discordUrl" target="_blank">Support</a>
      <a v-if="termsAndConditionsEnabled" href="#"
        @click.prevent="$emit('update:showDialog', true)">
        Terms & Conditions
      </a>
      <a :href="urlApi" target="_blank" rel="noopener">Api Version: {{ apiVersion }}</a>
      <a :href="urlApp" target="_blank" rel="noopener">App Version: {{ appVersion }}</a>
      <a href="https://rootstock.io/ecosystem/" target="_blank" rel="noopener">Ecosystem</a>
      <a href="#" rel="noopener" @click="showDialogPolicy">Privacy Policy</a>
    </div>
    <div class="d-flex ga-2">
      <v-btn variant="plain" href="https://x.com/rootstock_io" target="_blank"
             density="compact" :icon="mdiTwitter">
      </v-btn>
      <v-btn variant="plain" href="https://github.com/rsksmart/2wp-app" target="_blank"
             density="compact" :icon="mdiGithub">
      </v-btn>
      <v-btn variant="plain" density="compact" :href="discordUrl" target="_blank"
        :icon="mdiDiscord">
      </v-btn>
    </div>
    <policy-dialog v-model:showDialogPolicy="showPolicyDialogRef" />
  </v-footer>
</template>

<script lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import { mdiTwitter, mdiGithub, mdiDiscord } from '@mdi/js';
import { useRoute } from 'vue-router';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import * as constants from '@/common/store/constants';
import { Feature } from '@/common/types';
import { useTheme } from 'vuetify';
import PolicyDialog from '@/common/components/common/PolicyDialog.vue';

export default {
  name: 'FooterRsk',
  components: {
    PolicyDialog,
  },
  setup() {
    const store = useStore();
    const appVersion = computed<string>(() => store.getters.appVersion);
    const route = useRoute();
    const isLedger = useGetter<boolean>('web3Session', constants.SESSION_IS_LEDGER_CONNECTED);
    const isTrezor = useGetter<boolean>('web3Session', constants.SESSION_IS_TREZOR_CONNECTED);
    const isMetamask = useGetter<boolean>('web3Session', constants.SESSION_IS_METAMASK_CONNECTED);
    const isRloginDefined = useGetter<boolean>('web3Session', constants.SESSION_IS_RLOGIN_DEFINED);
    const termsAndConditionsEnabled = useStateAttribute<Feature>('web3Session', 'termsAndConditionsEnabled');
    const getApiVersion = useAction('web3Session', constants.SESSION_ADD_API_VERSION);
    const apiVersion = useStateAttribute<string>('web3Session', 'apiVersion');
    const showPolicyDialogRef = ref(false);
    const currentYear = new Date().getFullYear();

    const urlApp = computed(() => `https://github.com/rsksmart/2wp-app/releases/tag/v${appVersion.value}`);
    const urlApi = computed(() => `https://github.com/rsksmart/2wp-api/releases/tag/v${apiVersion.value}`);
    const discordUrl = 'https://discord.com/channels/842021106956238848/1123675841369489438';

    function getDevPortalSlug() {
      const [, feature, wallet] = route.path.split('/');
      if (feature === 'pegin' && wallet) {
        return `${feature}/${wallet}`;
      }
      if (feature === 'status') {
        return '';
      }
      if (feature === 'pegout' && isRloginDefined.value) {
        if (isLedger.value) {
          return `${feature}/ledger`;
        }
        if (isTrezor.value) {
          return `${feature}/trezor`;
        }
        if (isMetamask.value) {
          return `${feature}/metamask`;
        }
      }
      return feature;
    }

    function closeDialogPolicy() {
      showPolicyDialogRef.value = false;
    }

    function showDialogPolicy() {
      showPolicyDialogRef.value = true;
    }

    const { global: { current } } = useTheme();
    function getLogoSrc() {
      return current.value.dark ? require('@/assets/logo-rootstocklabs-white.svg') : require('@/assets/logo-rootstocklabs-black.svg');
    }

    const helpUrl = computed(() => `https://dev.rootstock.io/guides/two-way-peg-app/${getDevPortalSlug()}`);

    onBeforeMount(getApiVersion);

    return {
      urlApi,
      urlApp,
      helpUrl,
      discordUrl,
      appVersion,
      apiVersion,
      mdiTwitter,
      mdiDiscord,
      mdiGithub,
      termsAndConditionsEnabled,
      showDialogPolicy,
      closeDialogPolicy,
      showPolicyDialogRef,
      getLogoSrc,
      currentYear,
    };
  },
};
</script>

<style scoped>
p {
  font-size: 10px;
  line-height: 1;
}
</style>
