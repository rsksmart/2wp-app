<template>
<v-container fluid class="exchange form normalized-height container
  max-width mx-6 mt-6">
  <v-col class="px-0">
    <v-row class="d-flex justify-center">
      <h2 class="d-flex justify-center">Send {{environmentContext.getRbtcTicker()}}.
        Get {{environmentContext.getBtcTicker()}}.</h2>
    </v-row>
    <v-row class="exchange-form">
      <v-col cols="8" lg="8" >
        <rsk-wallet-connection @connectingWallet="openAddressDialog"/>
        <v-divider color="#C4C4C4"/>
        <rbtc-input-amount/>
        <v-divider color="#C4C4C4"/>
        <v-container class="form-step pb-0 pt-3 mb-3">
          <v-row class="mx-0 align-start">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[focus ?
              'number-filled' : 'number']">3</div>
            </v-col>
            <v-col class="pl-0 ma-0 pb-0">
              <p v-bind:class="{'boldie': focus}">
                Recipient address:
              </p>
              <v-row class="ma-0 pa-0">
                <v-col cols="6" class="pa-0" >
                  <v-text-field class="disabled-input" :value="session.btcDerivedAddress"
                                disabled color="#F8F5F5"
                                solo hide-details full-width single-line flat/>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
        <v-divider color="#C4C4C4"/>
        <rsk-fee-select/>
      </v-col>
      <v-col cols="4" lg="4">
        <tx-summary
          :showTxId="true"
          :initialExpand="true"
          :type="typeSummary"
          :orientation="orientationSummary"/>
      </v-col>
    </v-row>
    <v-row v-if="showAddressDialog">
      <address-dialog @closeDialog="closeAddressDialog"/>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
        <v-btn @click="back"
        rounded outlined color="#00B520" width="110"
                :disabled="pegOutFormState.matches(['loading', 'goingHome'])">
          <span>Back</span>
        </v-btn>
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0">
        <v-btn v-if="!pegOutFormState.matches(['loading'])" rounded color="#00B43C"
                @click="send"
                :disabled="!isReadyToCreate || pegOutFormState.matches(['goingHome'])">
          <span class="whiteish">Send</span>
          <v-icon class="ml-2" color="#fff">mdi-send-outline</v-icon>
        </v-btn>
        <v-progress-circular v-if="pegOutFormState.matches(['loading'])"
                              indeterminate color="#00B520" class="mr-10"/>
      </v-col>
    </v-row>
  </v-col>
  <template v-if="showTxErrorDialog">
    <tx-error-dialog :showTxErrorDialog="showTxErrorDialog"
                     :errorMessage="txError" @closeErrorDialog="closeTxErrorDialog"/>
  </template>
</v-container>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';
import RbtcInputAmount from '@/components/pegout/RbtcInputAmount.vue';
import RskWalletConnection from '@/components/pegout/RskWalletConnection.vue';
import RskFeeSelect from '@/components/pegout/RskFeeSelect.vue';
import AddressDialog from '@/components/pegout/AddressDialog.vue';
import TxSummary from '@/components/exchange/TxSummary.vue';
import { TxStatusType } from '@/types/store';
import { Machine } from '@/services/utils';
import { TxSummaryOrientation } from '@/types/Status';
import { Action, Getter, State } from 'vuex-class';
import * as constants from '@/store/constants';
import TxErrorDialog from '@/components/exchange/TxErrorDialog.vue';
import { SessionState } from '@/types';

@Component({
  components: {
    AddressDialog,
    RbtcInputAmount,
    RskWalletConnection,
    RskFeeSelect,
    TxSummary,
    TxErrorDialog,
  },
})
export default class PegOutForm extends Vue {
  pegOutFormState: Machine<'loading' | 'goingHome' | 'fill'> = new Machine('fill');

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  recipientAddress = '';

  showAddressDialog = false;

  focus = false;

  nextPage = 'Confirmation';

  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.VERTICAL;

  showTxErrorDialog = false;

  txError = '';

  @State('web3Session') session !: SessionState;

  @Action(constants.PEGOUT_TX_SEND, { namespace: 'pegOutTx' }) sendTx !: () => Promise<void>;

  @Getter(constants.PEGOUT_TX_IS_ENOUGH_BALANCE, { namespace: 'pegOutTx' }) isEnoughBalance !: boolean;

  @Emit()
  closeAddressDialog() {
    this.showAddressDialog = false;
  }

  @Emit()
  back():void {
    this.$router.push({ name: 'Home' });
  }

  @Emit()
  openAddressDialog() {
    this.showAddressDialog = true;
  }

  @Emit()
  send() {
    this.pegOutFormState.send('loading');
    this.sendTx()
      .then(() => {
        this.changePage();
      })
      .catch((error:Error) => {
        this.txError = error.message;
        this.showTxErrorDialog = true;
      })
      .finally(() => {
        this.pegOutFormState.send('fill');
      });
  }

  get isReadyToCreate(): boolean {
    return this.isEnoughBalance
      && !!this.session.btcDerivedAddress;
  }

  @Emit()
  closeTxErrorDialog() {
    this.showTxErrorDialog = false;
  }

  @Emit('changePage')
  changePage() {
    return this.nextPage;
  }
}
</script>
