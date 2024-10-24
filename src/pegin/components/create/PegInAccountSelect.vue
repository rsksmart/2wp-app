<template>
  <v-row>
    <v-col cols="7" class="d-flex align-center justify-end">
      <v-row>
        <span class="align-center">
          {{ walletService.name().formal_name }} | {{ selectedAccountBalance.toBTCTrimmedString() }}
          {{ environmentContext.getBtcTicker() }}
          <v-tooltip
            activator="parent"
            location="bottom"
          >{{ selectedAccountBalance.toBTCString() }} {{ environmentContext.getBtcTicker() }}
          </v-tooltip>
        </span>
      </v-row>
    </v-col>
    <v-col cols="5">
      <div v-if="singleAccountType" class="d-flex align-center justify-end ga-4">
        <v-btn
            :color="selectedAccountTypeBadge.color"
            variant="flat"
            readonly="true"
          >
            {{ selectedAccountTypeBadge.text }}
          </v-btn>
      </div>
      <div v-else class="d-flex align-center justify-end ga-4">
        <v-menu location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              :color="selectedAccountTypeBadge.color"
              v-bind="props"
              variant="elevated"
            >
              {{ selectedAccountTypeBadge.text }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in balancesPerAccountType"
              :key="index"
              :value="item.value"
              @click="accountChanged(item.value)"
            >
              <template #append>
                    <v-chip tag="span" variant="flat" :color="item.appendColor" density="compact">
                      {{ item.appendText }}
                    </v-chip>
                </template>
            </v-list-item>
          </v-list>
        </v-menu>
        <div v-if="loadingBalance" class="d-flex align-center ga-2">
          <v-progress-circular size="small" indeterminate color="bw-500"/>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  ref, defineComponent, computed,
} from 'vue';
import { mdiBitcoin, mdiInformation } from '@mdi/js';
import * as constants from '@/common/store/constants';
import { BtcAccount } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { AccountBalance, BtcWallet, SatoshiBig } from '@/common/types';
import { WalletService } from '@/common/services';

export default defineComponent({
  name: 'PegInAccountSelect',
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const selectedAccountType = ref();
    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const balances = useStateAttribute<AccountBalance>('pegInTx', 'balances');
    const loadingBalance = useStateAttribute<boolean>('pegInTx', 'loadingBalance');
    const walletService = useStateAttribute<WalletService>('pegInTx', 'walletService');
    const stateSelectedAccount = useStateAttribute<BtcAccount>('pegInTx', 'selectedAccount');
    const selectAccount = useAction('pegInTx', constants.PEGIN_TX_SELECT_ACCOUNT_TYPE);
    const calculateTxFee = useAction('pegInTx', constants.PEGIN_TX_CALCULATE_TX_FEE);
    const selectedAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);

    function accountChanged(account: BtcAccount) {
      selectedAccountType.value = account;
      selectAccount(account);
      calculateTxFee();
      context.emit('accountChanged', account);
    }

    const balancesPerAccountType = computed(() => ([
      {
        title: balances.value.legacy.toBTCTrimmedString(),
        value: BtcAccount.BITCOIN_LEGACY_ADDRESS,
        appendText: 'Legacy',
        appendColor: 'pink',
      },
      {
        title: balances.value.segwit.toBTCTrimmedString(),
        value: BtcAccount.BITCOIN_SEGWIT_ADDRESS,
        appendText: 'Segwit',
        appendColor: 'orange',
      },
      {
        title: balances.value.nativeSegwit.toBTCTrimmedString(),
        value: BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        appendText: 'Native Segwit',
        appendColor: 'teal',
      },
    ]));

    const singleAccountType = computed(() => {
      if (walletService.value) {
        return walletService.value.availableAccounts().length === 1
          ? walletService.value.availableAccounts()[0] : '';
      }
      return '';
    });

    const selectedAccountTypeBadge = computed(() => {
      const selected = balancesPerAccountType.value
        .find(({ value }) => value === selectedAccountType.value);
      return { color: selected?.appendColor, text: selected?.appendText };
    });

    function setSelectedAccount(account: string) {
      selectedAccountType.value = account;
    }

    if (singleAccountType.value) {
      selectedAccountType.value = singleAccountType.value;
    } else {
      const [firstAccount] = walletService.value.availableAccounts();
      selectedAccountType.value = firstAccount;
    }
    selectAccount(selectedAccountType.value);
    calculateTxFee();

    if (stateSelectedAccount.value) {
      selectedAccountType.value = stateSelectedAccount.value;
    }
    const tooltipText = 'Listed amounts represent the balance using addresses from your first account including change.';

    return {
      singleAccountType,
      environmentContext,
      selectedAccountType,
      loadingBalance,
      mdiInformation,
      balances,
      mdiBitcoin,
      balancesPerAccountType,
      selectedAccountTypeBadge,
      tooltipText,
      setSelectedAccount,
      bitcoinWallet,
      walletService,
      selectedAccountBalance,
      accountChanged,
    };
  },
});
</script>
