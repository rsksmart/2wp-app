<template>
  <v-row >
    <v-col cols="7" class="d-flex align-center justify-end">
      <v-btn v-if="singleAccountType" variant="text" size="small"
        density="compact" rounded="full" :icon="mdiContentCopy"
            @click="copyFullAccountAddress"
          />
      <span class="align-center text-no-wrap">
        {{ walletInfo }} | {{ selectedAccountBalance.toBTCTrimmedString() }}
        {{ environmentContext.getBtcTicker() }}
        <v-tooltip
          activator="parent"
          location="bottom"
        >{{ selectedAccountBalance.toBTCString() }} {{ environmentContext.getBtcTicker() }}
        </v-tooltip>
      </span>
    </v-col>
    <v-col cols="5" class="pa-0 d-flex align-center">
      <div v-if="singleAccountType" class="d-flex align-center justify-end ga-4">
        <v-btn
              v-bind="props"
              variant="plain"
              class="h-100"
            >
              <template #default>
                <v-chip v-show="selectedAccountType"
                  variant="flat" :color="selectedAccountTypeBadge.color" density="compact">
                  {{ selectedAccountTypeBadge.text }}
                </v-chip>
              </template>
            </v-btn>
      </div>
      <div v-else class="d-flex align-center justify-end h-100 w-100 pa-0">
        <v-menu location="bottom" no-click-animation="true">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="plain"
              class="h-100"
            >
              <template #default>
                <v-chip v-show="selectedAccountType"
                  variant="flat" :color="selectedAccountTypeBadge.color" density="compact">
                  {{ selectedAccountTypeBadge.text }}
                </v-chip>
              </template>
              <template #append>
                <v-icon :icon="mdiChevronDown" />
              </template>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in balancesPerAccountType"
              :key="index"
              :value="item.value"
              @click="accountChanged(item.value)"
            >
            <template #title>
              <span class="text-h6 mx-1">{{ item.title }}</span>
            </template>
              <template #append>
                    <v-chip tag="span" variant="flat"
                    :color="item.appendColor" density="compact"
                    class="mx-3"
                    >
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
import { mdiBitcoin, mdiContentCopy, mdiChevronDown } from '@mdi/js';
import * as constants from '@/common/store/constants';
import { BtcAccount, WalletAddress } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { useAction, useGetter, useStateAttribute } from '@/common/store/helper';
import { AccountBalance, BtcWallet, SatoshiBig } from '@/common/types';
import { WalletService } from '@/common/services';
import { truncateString } from '@/common/utils';

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
    const addressList = useStateAttribute<WalletAddress[]>('pegInTx', 'addressList');
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

    const firstBtcAddress = computed(() => addressList.value[0]?.address);

    const walletInfo = computed(() => (!singleAccountType.value
      ? walletService.value.name().formal_name : truncateString(firstBtcAddress.value)));

    function setSelectedAccount(account: string) {
      selectedAccountType.value = account;
    }

    function copyFullAccountAddress() {
      navigator.clipboard.writeText(firstBtcAddress.value);
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
      mdiContentCopy,
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
      mdiChevronDown,
      walletInfo,
      copyFullAccountAddress,
    };
  },
});
</script>
