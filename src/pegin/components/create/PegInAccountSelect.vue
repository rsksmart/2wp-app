<template>
  <v-row no-gutters align="center">
    <v-col class="d-flex align-center ga-1">
      <v-btn v-if="singleAccountType" variant="text" size="small"
        density="compact" rounded="full" :icon="mdiContentCopy"
            @click="copyFullAccountAddress"
          />
      <span class="align-center text-no-wrap">
        {{ walletName }} | {{ selectedAccountBalance.toBTCTrimmedString() }}
        {{ environmentContext.getBtcTicker() }}
        <v-tooltip
          activator="parent"
          location="bottom"
        >{{ selectedAccountBalance.toBTCString() }} {{ environmentContext.getBtcTicker() }}
        </v-tooltip>
      </span>
      <v-chip v-if="singleAccountType" class="mx-1"
        variant="flat" :color="selectedAccountTypeBadge.color" density="compact">
        {{ selectedAccountTypeBadge.text }}
      </v-chip>
      <v-btn variant="text"
        density="compact" rounded="full" :icon="mdiPencil" @click="displayUtxoSelector"></v-btn>
    </v-col>
    <v-col v-if="!singleAccountType">
      <div>
        <v-menu location="bottom end" :no-click-animation="true"
        :disabled="loadingBalance || !atPeginForm">
          <template v-slot:activator="{ props }">
            <v-btn
              class="opacity-100"
              v-bind="props"
              variant="plain"
              size="small"
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
                    <v-tooltip text="Select UTXOs">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" variant="text"
                        density="compact" rounded="full" :icon="mdiPencil"
                        @click="displayUtxoSelector">
                    </v-btn>
                      </template>
                    </v-tooltip>
                </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-col>
    <v-progress-circular v-if="loadingBalance" size="small" indeterminate color="bw-500"/>
    <v-col cols="auto">
    </v-col>
    <uxto-selector :show-dialog="showUtxoDialog" @update:showDialog="displayUtxoSelector"/>
  </v-row>
</template>

<script lang="ts">
import {
  ref, defineComponent, computed, watch,
} from 'vue';
import { mdiPencil, mdiContentCopy, mdiChevronDown } from '@mdi/js';
import * as constants from '@/common/store/constants';
import { BtcAccount, WalletAddress } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import {
  useAction, useGetter, useStateAttribute,
} from '@/common/store/helper';
import { AccountBalance, BtcWallet, SatoshiBig } from '@/common/types';
import { WalletService } from '@/common/services';
import { truncateString } from '@/common/utils';
import UxtoSelector from '@/common/components/layouts/UxtoSelector.vue';
import { useWalletInfo } from '@reown/appkit/vue';

export default defineComponent({
  name: 'PegInAccountSelect',
  components: {
    UxtoSelector,
  },
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const selectedAccountType = ref();
    const showUtxoDialog = ref(false);
    const bitcoinWallet = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const balances = useStateAttribute<AccountBalance>('pegInTx', 'balances');
    const loadingBalance = useStateAttribute<boolean>('pegInTx', 'loadingBalance');
    const walletService = useStateAttribute<WalletService>('pegInTx', 'walletService');
    const stateSelectedAccount = useStateAttribute<BtcAccount>('pegInTx', 'selectedAccount');
    const addressList = useStateAttribute<WalletAddress[]>('pegInTx', 'addressList');
    const selectAccount = useAction('pegInTx', constants.PEGIN_TX_SELECT_ACCOUNT_TYPE);
    const calculateTxFee = useAction('pegInTx', constants.PEGIN_TX_CALCULATE_TX_FEE);
    const selectedAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);
    const peginCurrentView = useStateAttribute<string>('pegInTx', 'currentView');
    const atPeginForm = computed(() => peginCurrentView.value === 'PegInForm');

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

    const walletName = computed(() => {
      if (!singleAccountType.value) {
        if (bitcoinWallet.value === constants.WALLET_NAMES.REOWN.long_name) {
          const { walletInfo } = useWalletInfo();
          return walletInfo?.name;
        }
        return walletService.value.name().formal_name;
      }
      return truncateString(firstBtcAddress.value);
    });

    function setSelectedAccount(account: string) {
      selectedAccountType.value = account;
    }

    function copyFullAccountAddress() {
      navigator.clipboard.writeText(firstBtcAddress.value);
    }

    function displayUtxoSelector() {
      showUtxoDialog.value = !showUtxoDialog.value;
    }

    if (singleAccountType.value) {
      selectedAccountType.value = singleAccountType.value;
    } else {
      const [firstAccount] = walletService.value.availableAccounts();
      selectedAccountType.value = firstAccount;
    }

    watch(loadingBalance, () => {
      if (!loadingBalance.value) {
        balancesPerAccountType.value.sort((a, b) => Number(b.title) - Number(a.title));
      }
    });

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
      mdiPencil,
      balancesPerAccountType,
      selectedAccountTypeBadge,
      tooltipText,
      setSelectedAccount,
      bitcoinWallet,
      walletService,
      selectedAccountBalance,
      accountChanged,
      mdiChevronDown,
      walletName,
      copyFullAccountAddress,
      atPeginForm,
      displayUtxoSelector,
      showUtxoDialog,
    };
  },
});
</script>
