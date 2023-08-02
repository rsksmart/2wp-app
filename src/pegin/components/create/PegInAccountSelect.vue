<template>
  <div id="option-1" class="py-4">
    <v-row class="align-start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">1</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          {{
            isLiquality ?
            environmentContext.getBtcText() + ' account balance:' :
            'Select ' + environmentContext.getBtcText() + ' account to send from:'
          }}
        </p>
        <v-row class="mx-0 mt-4">
          <v-col cols="7" class="pl-0 pb-0">
            <v-select
              v-if="!isLiquality"
              v-model="btcAccountTypeSelected" :items="accountBalances" color="#fff"
              class="account-select"
              label="Select the account" solo dense
              @focus="focus = true"
              @blur="focus = false"
              :disabled="isLiquality"
              @change="accountChanged"/>
            <p class="label-liquality" v-if="isLiquality">
              {{ accountBalances[2].text }}
            <p/>
          </v-col>
          <v-col v-if="!isLiquality" cols="1" class="pb-0 pt-5">
            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  small
                  color="teal darken-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-information
                </v-icon>
              </template>
              <span>
                Listed amounts represent the balance using
                addresses from your first account including change.
              </span>
            </v-tooltip>
          </v-col>
          <v-col v-if="loadingBalance" cols="4" class="d-flex align-start pa-0">
            <v-row class="d-flex justify-start pt-6 ma-0">
              <span class="d-flex align-center">Loading balances   </span>
              <v-progress-circular
                size="17"
                width="2"
                indeterminate
                color="#C4C4C4"
                class="mx-5"
              ></v-progress-circular>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import * as constants from '@/common/store/constants';
import { BtcAccount, BtcWallet } from '@/common/types/pegInTx';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { ref, watch } from 'vue';
import { useAction, useStateAttribute } from '@/common/store/helper';
import { AccountBalance } from '@/common/types';

export default {
  name: 'PegInAccountSelect',
  setup(_, context) {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const isLiquality = ref(false);
    const focus = ref(false);
    const accountBalances = ref<{
      text: string;
      value: string;
      disabled: boolean;
    }[]>([]);
    const btcAccountTypeSelected = ref('');

    const selectedAccount  = useStateAttribute<BtcAccount>('pegInTx', 'selectedAccount');
    const bitcoinWallet  = useStateAttribute<BtcWallet>('pegInTx', 'bitcoinWallet');
    const balances  = useStateAttribute<AccountBalance>('pegInTx', 'balances');
    const loadingBalance  = useStateAttribute<Boolean>('pegInTx', 'loadingBalance');
    const selectAccount = useAction('pegInTx', constants.PEGIN_TX_SELECT_ACCOUNT_TYPE);
    const calculateTxFee = useAction('pegInTx', constants.PEGIN_TX_CALCULATE_TX_FEE);

    function accountChanged(account:BtcAccount) {
      selectAccount(account);
      calculateTxFee();
      context.emit('accountChanged', account);
    }

    function getAccountBalanceText(accountType: string): string {
      let text = '';
      switch (accountType) {
        case constants.BITCOIN_LEGACY_ADDRESS:
          text = `Legacy - ${balances.value.legacy.toBTCStringNotZeroPadded()} ${environmentContext.getBtcTicker()}`;
          break;
        case constants.BITCOIN_SEGWIT_ADDRESS:
          text = `Segwit - ${balances.value.segwit.toBTCStringNotZeroPadded()} ${environmentContext.getBtcTicker()}`;
          break;
        case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
          text = `Native segwit - ${balances.value.nativeSegwit.toBTCStringNotZeroPadded()} ${environmentContext.getBtcTicker()}`;
          break;
        default:
          break;
      }
      return text;
    }

    function fillAccountBalances() {
      accountBalances.value.forEach((accountItem, idx) => {
        accountBalances.value[idx].text = getAccountBalanceText(accountItem.value);
      });
    }

    function isAccountEnabled(accountType:BtcAccount): boolean {
      let enabled:boolean;
      switch (accountType) {
        case constants.BITCOIN_SEGWIT_ADDRESS:
        case constants.BITCOIN_LEGACY_ADDRESS:
          enabled = bitcoinWallet.value !== constants.WALLET_LIQUALITY;
          break;
        default:
          enabled = true;
      }
      return enabled;
    }

    watch(balances, fillAccountBalances);

    if (selectedAccount.value) {
      btcAccountTypeSelected.value = selectedAccount.value;
    }
    accountBalances.value = [
      {
        text: getAccountBalanceText(constants.BITCOIN_SEGWIT_ADDRESS),
        value: constants.BITCOIN_SEGWIT_ADDRESS,
        disabled: !isAccountEnabled(constants.BITCOIN_SEGWIT_ADDRESS),
      },
      {
        text: getAccountBalanceText(constants.BITCOIN_LEGACY_ADDRESS),
        value: constants.BITCOIN_LEGACY_ADDRESS,
        disabled: !isAccountEnabled(constants.BITCOIN_LEGACY_ADDRESS),
      },
      {
        text: getAccountBalanceText(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS),
        value: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        disabled: !isAccountEnabled(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS),
      },
    ];

    if (bitcoinWallet.value === constants.WALLET_LIQUALITY) {
      accountChanged(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS);
      isLiquality.value = true;
    }

    return {
      isLiquality,
      environmentContext,
      focus,
      accountBalances,
      btcAccountTypeSelected,
      loadingBalance,
      accountChanged,
    };
  }
}

//
// @Component({})
// class PegInAccountSelect extends Vue {
//   environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
//
//   isLiquality = false;
//
//   focus = false;
//
//   accountBalances: {
//     text: string;
//     value: string;
//     disabled: boolean;
//   }[] = [];
//
//   btcAccountTypeSelected = '';
//
//   @State('pegInTx') pegInTxState!: PegInTxState;
//
//   @Action(constants.PEGIN_TX_SELECT_ACCOUNT_TYPE, { namespace: 'pegInTx' }) selectAccount !: (accountType: BtcAccount) => void;
//
//   @Action(constants.PEGIN_TX_CALCULATE_TX_FEE, { namespace: 'pegInTx' }) calculateTxFee !: () => Promise<void>;
//
//   // eslint-disable-next-line class-methods-use-this
//   get maxAddresses(): number {
//     return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletAddressHardStop;
//   }
//
//   get isLedgerWallet() {
//     return this.pegInTxState.bitcoinWallet === constants.WALLET_LEDGER;
//   }
//
//   @Emit('accountChanged')
//   accountChanged(account:BtcAccount) {
//     this.selectAccount(account);
//     this.calculateTxFee();
//     return account;
//   }
//
//   @Emit()
//   getAccountBalanceText(accountType: string): string {
//     let text = '';
//     switch (accountType) {
//       case constants.BITCOIN_LEGACY_ADDRESS:
//         text = `Legacy - ${this.pegInTxState.balances.legacy.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
//         break;
//       case constants.BITCOIN_SEGWIT_ADDRESS:
//         text = `Segwit - ${this.pegInTxState.balances.segwit.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
//         break;
//       case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
//         text = `Native segwit - ${this.pegInTxState.balances.nativeSegwit.toBTCStringNotZeroPadded()} ${this.environmentContext.getBtcTicker()}`;
//         break;
//       default:
//         break;
//     }
//     return text;
//   }
//
//   @Watch('pegInTxState.balances')
//   fillAccountBalances() {
//     this.accountBalances.forEach((accountItem, idx) => {
//       this.accountBalances[idx].text = this.getAccountBalanceText(accountItem.value);
//     });
//   }
//
//   @Emit()
//   isAccountEnabled(accountType:BtcAccount): boolean {
//     let enabled:boolean;
//     switch (accountType) {
//       case constants.BITCOIN_SEGWIT_ADDRESS:
//       case constants.BITCOIN_LEGACY_ADDRESS:
//         enabled = this.pegInTxState.bitcoinWallet !== constants.WALLET_LIQUALITY;
//         break;
//       default:
//         enabled = true;
//     }
//     return enabled;
//   }
//
//   created() {
//     if (this.pegInTxState.selectedAccount) {
//       this.btcAccountTypeSelected = this.pegInTxState.selectedAccount;
//     }
//     this.accountBalances = [
//       {
//         text: this.getAccountBalanceText(constants.BITCOIN_SEGWIT_ADDRESS),
//         value: constants.BITCOIN_SEGWIT_ADDRESS,
//         disabled: !this.isAccountEnabled(constants.BITCOIN_SEGWIT_ADDRESS),
//       },
//       {
//         text: this.getAccountBalanceText(constants.BITCOIN_LEGACY_ADDRESS),
//         value: constants.BITCOIN_LEGACY_ADDRESS,
//         disabled: !this.isAccountEnabled(constants.BITCOIN_LEGACY_ADDRESS),
//       },
//       {
//         text: this.getAccountBalanceText(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS),
//         value: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
//         disabled: !this.isAccountEnabled(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS),
//       },
//     ];
//
//     if (this.pegInTxState.bitcoinWallet === constants.WALLET_LIQUALITY) {
//       this.accountChanged(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS);
//       this.isLiquality = true;
//     }
//   }
// }
</script>
