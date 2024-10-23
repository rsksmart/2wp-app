<template>
  <header class="d-flex justify-space-between align-center py-4 px-8">
    <div class="d-flex align-center ga-2">
      <v-img inline width="160" alt="Rootstock logo" class="cursor-pointer"
             :src="getLogoSrc()" @click="goHome">
      </v-img>
      <h1 class="text-purple text-h5">PowPeg</h1>
    </div>
    <div class="d-flex align-center ga-5">
      <div class="d-flex align-center ga-2" v-if="connectedBtcWallet">
        <span>
          {{ connectedBtcWallet }} | {{ selectedBtcAccountBalance }}
          <v-tooltip
            activator="parent"
            location="bottom"
          >{{ selectedBtcAccountBalance.toBTCString() }} {{ environmentContext.getBtcTicker() }}
          </v-tooltip>
        </span>
      </div>
      <div class="d-flex align-center ga-4">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              v-bind="props"
            >
              {{ selectedAccountType }}
            </v-btn>
          </template>
          <template #append-inner>
          <v-chip v-show="selectedAccountType"
            variant="flat" :color="selectedAccountTypeBadge.color" density="compact">
            {{ selectedAccountTypeBadge.text }}
          </v-chip>
        </template>
        <template #item="{ props, item }">
          <v-list-item v-bind="props" class="d-flex px-3 ga-2">
            <template #title>
              <span class="text-h4">{{ props.title }}</span>
            </template>
              <template #prepend>
                <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
                  {{ environmentContext.getBtcTicker() }}
              </v-chip>
            </template>
            <template #append>
                <v-chip tag="span" variant="flat" :color="item.raw.appendColor" density="compact">
                  {{ item.raw.appendText }}
                </v-chip>
            </template>
          </v-list-item>
        </template>
        </v-menu>
      <v-select
        :disabled="loadingBalance"
        flat
        hide-details
        rounded="lg"
        variant="solo"
        density="default"
        placeholder="Select the account"
        :items="balancesPerAccountType"
        v-model="selectedAccountType"
        >
        <template #prepend-inner>
          <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
            {{ environmentContext.getBtcTicker() }}
          </v-chip>
        </template>
        <template #append-inner>
          <v-chip v-show="selectedAccountType"
            variant="flat" :color="selectedAccountTypeBadge.color" density="compact">
            {{ selectedAccountTypeBadge.text }}
          </v-chip>
        </template>
        <template #item="{ props, item }">
          <v-list-item v-bind="props" class="d-flex px-3 ga-2">
            <template #title>
              <span class="text-h4">{{ props.title }}</span>
            </template>
              <template #prepend>
                <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
                  {{ environmentContext.getBtcTicker() }}
              </v-chip>
            </template>
            <template #append>
                <v-chip tag="span" variant="flat" :color="item.raw.appendColor" density="compact">
                  {{ item.raw.appendText }}
                </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-select>
      <v-tooltip :text="tooltipText" location="bottom" max-width="240">
        <template v-slot:activator="{ props }">
          <v-icon :icon="mdiInformation" v-bind="props" color="green" />
        </template>
      </v-tooltip>
      <div v-if="loadingBalance" class="d-flex align-center ga-2">
        <span>Loading balances...</span>
        <v-progress-circular size="small" indeterminate color="bw-500"/>
      </div>
    </div>
      <div class="d-flex align-center ga-2" v-if="truncatedAccount && accountBalance">
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
  </header>
</template>

<script lang="ts">
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import {
  mdiContentCopy, mdiLinkOff, mdiBitcoin, mdiInformation,
} from '@mdi/js';
import * as constants from '@/common/store/constants';
import { computed, ref, watch } from 'vue';
import { truncateString } from '@/common/utils';
import {
  AccountBalance, BtcAccount, SatoshiBig, WeiBig,
} from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default {
  name: 'TopBar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const themeLight = ref(false);
    const selectedAccountType = ref();
    const vuetifyTheme = useTheme();

    const account = useGetter<string>('web3Session', constants.SESSION_GET_CHECKSUMMED_ACCOUNT);
    const connectedBtcWallet = useGetter<string>('pegInTx', constants.WALLET_NAME);
    const selectedBtcAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);
    const stateSelectedAccount = useStateAttribute<BtcAccount>('pegInTx', 'selectedAccount');
    const truncatedAccount = computed(() => truncateString(account.value));

    const balance = useStateAttribute<WeiBig>('web3Session', 'balance');
    const loadingBalance = useStateAttribute<boolean>('pegInTx', 'loadingBalance');
    const balances = useStateAttribute<AccountBalance>('pegInTx', 'balances');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const accountBalance = computed(() => {
      const amount = balance.value.toRBTCString().slice(0, 7);
      return `${amount} ${environmentContext.getRbtcTicker()}`;
    });

    const clearSession = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);

    const balancesPerAccountType = computed(() => ([
      {
        title: balances.value.legacy.toBTCTrimmedString(),
        value: constants.BITCOIN_LEGACY_ADDRESS,
        appendText: 'Legacy',
        appendColor: 'pink',
      },
      {
        title: balances.value.segwit.toBTCTrimmedString(),
        value: constants.BITCOIN_SEGWIT_ADDRESS,
        appendText: 'Segwit',
        appendColor: 'orange',
      },
      {
        title: balances.value.nativeSegwit.toBTCTrimmedString(),
        value: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        appendText: 'Native Segwit',
        appendColor: 'teal',
      },
    ]));

    const selectedAccountTypeBadge = computed(() => {
      const selected = balancesPerAccountType.value
        .find(({ value }) => value === selectedAccountType.value);
      return { color: selected?.appendColor, text: selected?.appendText };
    });

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

    if (stateSelectedAccount.value) {
      selectedAccountType.value = stateSelectedAccount.value;
    }

    watch(themeLight, (enabledLight) => {
      vuetifyTheme.global.name.value = enabledLight ? 'light' : 'dark';
    });

    const tooltipText = 'Listed amounts represent the balance using addresses from your first account including change.';

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
      connectedBtcWallet,
      selectedBtcAccountBalance,
      loadingBalance,
      balancesPerAccountType,
      selectedAccountType,
      mdiBitcoin,
      mdiInformation,
      selectedAccountTypeBadge,
      tooltipText,
    };
  },
};
</script>
<style scoped>
.v-btn--icon.bg-purple {
  color: #fff !important;
}
</style>
