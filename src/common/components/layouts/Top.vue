<template>
  <v-app-bar color="#fff" elevation="0" class="mx-8 top" style="position: relative; height: 80px;">
    <v-row justify="center">
      <v-col cols="11" class="d-flex flex-column align-start px-0">
        <v-col cols="auto" class="top-logo">
          <v-col cols="auto" class="pa-0">
            <v-img @click="toExchange" position="center left"
                   :src="require('@/assets/logo-rootstock-black.png')"
                   :alt="`${environmentContext.getRskText()} Two Way Peg`"
                   height="75" width="180" contain class="rsk-main-logo pa-0"/>
          </v-col>
        </v-col>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default {
  name: 'TopBar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const environmentVariables = EnvironmentAccessorService.getEnvironmentVariables();
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const isTestNet = computed(
      () => environmentVariables.vueAppCoin === constants.BTC_NETWORK_TESTNET,
    );

    function toExchange() {
      if (route.name !== 'Home') router.push({ name: 'Home' });
    }

    return {
      environmentVariables,
      environmentContext,
      isTestNet,
      toExchange,
    };
  },
};

// @Component
// class Top extends Vue {
//   environmentVariables = EnvironmentAccessorService.getEnvironmentVariables();
//
//   environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
//
//   @Emit()
//   toExchange() {
//     if (this.$router.currentRoute.name !== 'Home') this.$router.push({ name: 'Home' });
//   }
//
//   get isTestNet() {
//     return this.environmentVariables.vueAppCoin === constants.BTC_NETWORK_TESTNET;
//   }
//
//   // eslint-disable-next-line class-methods-use-this
//   get logo() {
//     return getMainLogo();
//   }
// }
</script>
