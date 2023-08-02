<template>
  <v-app-bar color="#fff" elevation="0" class="mx-8 top">
    <v-row justify="center">
      <v-col cols="11" class="d-flex flex-column align-start px-0">
        <v-col cols="auto" class="top-logo">
          <v-col cols="auto" class="px-0 pb-1">
            <v-img @click="toExchange" position="center left"
                   :src="logo"
                   :alt="`${environmentContext.getRskText()} Two Way Peg`"
                   height="65" width="180" contain class="rsk-main-logo"/>
          </v-col>
        </v-col>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script lang="ts">
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { getMainLogo } from '@/common/utils';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

export default {
  name: 'Top',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const environmentVariables = EnvironmentAccessorService.getEnvironmentVariables();
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const logo = getMainLogo();

    const isTestNet = computed(() => {
      return environmentVariables.vueAppCoin === constants.BTC_NETWORK_TESTNET;
    });

    function toExchange() {
      if (route.name !== 'Home') router.push({ name: 'Home' });
    }

    return {
      environmentVariables,
      environmentContext,
      isTestNet,
      toExchange,
      logo,
    };
  }
}

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
