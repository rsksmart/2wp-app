<template>
  <div class="mr-2">
    <span class="d-inline-block font-weight-bold my-3">
      Account Type
    </span>

    <div v-if="onlyNativeSegwit" class="d-flex justify-space-between align-center flex-grow-1
      bg-surface py-3 px-4 rounded-lg border">
      <div class="d-flex ga-2 align-center">
        <v-chip :prepend-icon="mdiBitcoin" class="btc-icon">
          {{ environmentContext.getBtcTicker() }}
        </v-chip>
        <span class="text-h4">
          {{ balances.nativeSegwit.toBTCTrimmedString() }}
        </span>
      </div>
      <v-chip variant="flat" color="teal" density="compact">Native Segwit</v-chip>
    </div>

    <div v-else class="d-flex align-center ga-4">
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
  </div>
</template>

<script lang="ts">
import {
  ref, defineComponent, watch, computed,
} from 'vue';
import { mdiBitcoin, mdiInformation } from '@mdi/js';
import * as constants from '@/common/store/constants';
import { BtcAccount } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useStateAttribute } from '@/common/store/helper';
import { AccountBalance, BtcWallet } from '@/common/types';

export default defineComponent({
  name: 'PegInAccountSelect',
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const selectedAccountType = ref();
    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const balances = useStateAttribute<AccountBalance>('pegInTx', 'balances');
    const loadingBalance = useStateAttribute<boolean>('pegInTx', 'loadingBalance');
    const selectAccount = useAction('pegInTx', constants.PEGIN_TX_SELECT_ACCOUNT_TYPE);
    const calculateTxFee = useAction('pegInTx', constants.PEGIN_TX_CALCULATE_TX_FEE);

    function accountChanged(account: BtcAccount) {
      selectAccount(account);
      calculateTxFee();
      context.emit('accountChanged', account);
    }

    watch(selectedAccountType, accountChanged);

    accountChanged(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS);

    const balancesPerAccountType = [
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
    ];

    const onlyNativeSegwit = computed(() => {
      const wallets = [
        constants.WALLET_NAMES.LEATHER.long_name,
      ];
      return wallets.some((wallet) => wallet === bitcoinWallet.value);
    });

    const selectedAccountTypeBadge = computed(() => {
      const selected = balancesPerAccountType
        .find(({ value }) => value === selectedAccountType.value);
      return { color: selected?.appendColor, text: selected?.appendText };
    });

    const tooltipText = 'Listed amounts represent the balance using addresses from your first account including change.';

    return {
      onlyNativeSegwit,
      environmentContext,
      selectedAccountType,
      loadingBalance,
      mdiInformation,
      balances,
      mdiBitcoin,
      balancesPerAccountType,
      selectedAccountTypeBadge,
      tooltipText,
    };
  },
});
</script>
