<template>
  <div id="option-1" class="py-4">
    <v-row align="start" class="mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">1</div>
      </v-col>
      <v-col class="pl-0">
        <p v-bind:class="{'boldie': focus}">
          Select {{environmentContext.getBtcText()}} account to send from:
        </p>
        <v-row class="mx-0 mt-4">
          <v-col cols="7" class="pl-0 pb-0">
            <v-select v-model="btcAccountTypeSelected" :items="accountBalances" color="#fff"
                      label="Select the account" solo dense
                      @focus="focus = true"
                      @blur="focus = false"
                      @change="accountChanged"/>
          </v-col>
          <v-col cols="1" class="pb-0 pt-5">
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
              <p v-if="isLedgerWallet" class="tooltip-form mb-0">
                Native segwit is coming soon for Ledger devices!
              </p>
              <p v-if="isLedgerWallet" class="tooltip-form mb-0">
                Listed amounts represent the balance up to the first {{maxAddressesLedger}}
                addresses from Legacy and Segwit accounts including change.
              </p>
              <span v-if="!isLedgerWallet">
                      Listed amounts represent the balance up to the first {{maxAddressesTrezor}}
                      addresses from Legacy, Segwit and Native segwit accounts including change.
                    </span>
            </v-tooltip>
          </v-col>
          <v-col v-if="pegInTxState.loadingBalance" cols="4" class="d-flex align-start pa-0">
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
import {
  Component, Vue, Emit, Watch,
} from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import * as constants from '@/store/constants';
import { BtcAccount, PegInTxState } from '@/types/pegInTx';
import { EnvironmentAccessorService } from '@/services/enviroment-accessor.service';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component({})
export default class PegInAccountSelect extends Vue {
  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  focus = false;

  accountBalances: {
    text: string;
    value: string;
    disabled: boolean;
  }[] = [];

  btcAccountTypeSelected = '';

  @State('pegInTx') pegInTxState!: PegInTxState;

  @Action(constants.PEGIN_TX_SELECT_ACCOUNT_TYPE, { namespace: 'pegInTx' }) selectAccount !: (accountType: BtcAccount) => void;

  @Action(constants.PEGIN_TX_CALCULATE_TX_FEE, { namespace: 'pegInTx' }) calculateTxFee !: () => Promise<void>;

  // eslint-disable-next-line class-methods-use-this
  get maxAddressesLedger(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletAddressesPerCallLedger
      * EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletMaxCallLedger;
  }

  // eslint-disable-next-line class-methods-use-this
  get maxAddressesTrezor(): number {
    return EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletAddressesPerCallTrezor
      * EnvironmentAccessorService.getEnvironmentVariables().vueAppWalletMaxCallTrezor;
  }

  get isLedgerWallet() {
    return this.pegInTxState.bitcoinWallet === constants.WALLET_LEDGER;
  }

  @Emit('accountChanged')
  accountChanged(account:BtcAccount) {
    this.selectAccount(account);
    this.calculateTxFee();
    return account;
  }

  @Emit()
  getAccountBalanceText(accountType: string): string {
    let text = '';
    switch (accountType) {
      case constants.BITCOIN_LEGACY_ADDRESS:
        text = `Legacy - ${this.pegInTxState.balances.legacy.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_SEGWIT_ADDRESS:
        text = `Segwit - ${this.pegInTxState.balances.segwit.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
        break;
      case constants.BITCOIN_NATIVE_SEGWIT_ADDRESS:
        text = `Native segwit - ${this.pegInTxState.balances.nativeSegwit.toBTCTrimmedString()} ${this.environmentContext.getBtcTicker()}`;
        break;
      default:
        break;
    }
    return text;
  }

  @Watch('pegInTxState.balances')
  fillAccountBalances() {
    this.accountBalances.forEach((accountItem, idx) => {
      this.accountBalances[idx].text = this.getAccountBalanceText(accountItem.value);
    });
  }

  created() {
    if (this.pegInTxState.selectedAccount) {
      this.btcAccountTypeSelected = this.pegInTxState.selectedAccount;
    }

    this.accountBalances = [
      {
        text: this.getAccountBalanceText(constants.BITCOIN_SEGWIT_ADDRESS),
        value: constants.BITCOIN_SEGWIT_ADDRESS,
        disabled: false,
      },
      {
        text: this.getAccountBalanceText(constants.BITCOIN_LEGACY_ADDRESS),
        value: constants.BITCOIN_LEGACY_ADDRESS,
        disabled: false,
      },
      {
        text: this.getAccountBalanceText(constants.BITCOIN_NATIVE_SEGWIT_ADDRESS),
        value: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        disabled: false,
      },
    ];
  }
}
</script>
