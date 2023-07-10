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
import { Vue, Component, Emit } from 'vue-facing-decorator';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { getMainLogo } from '@/common/utils';

@Component
export default class Top extends Vue {
  environmentVariables = EnvironmentAccessorService.getEnvironmentVariables();

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Emit()
  toExchange() {
    if (this.$router.currentRoute.name !== 'Home') this.$router.push({ name: 'Home' });
  }

  get isTestNet() {
    return this.environmentVariables.vueAppCoin === constants.BTC_NETWORK_TESTNET;
  }

  // eslint-disable-next-line class-methods-use-this
  get logo() {
    return getMainLogo();
  }
}
</script>
