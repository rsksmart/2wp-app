<template>
<v-container fluid class="exchange-form normalized-height container
  max-width mx-6 mt-6">
  <v-container>
    <v-tour name="pegOutTour" :steps="tourSteps" :callbacks="tourCallBacks">
    </v-tour>
  </v-container>
  <v-col class="px-0">
    <v-row class="mx-0">
        <v-col cols="1" class="pa-0 d-flex align-center">
          <v-img position="center left"
                 src="@/assets/exchange/arrow.png" height="40" contain/>
        </v-col>
        <v-col class="px-0">
         <h1 class="justify-center text-left">Send {{environmentContext.getRbtcTicker()}}.
          Get {{environmentContext.getBtcTicker()}}.</h1>
        </v-col>
      </v-row>
    <v-row class="exchange-form">
      <v-col cols="8" lg="8" >
        <rsk-wallet-connection
          @switchDeriveButton="switchDeriveButton"/>
        <v-divider color="#C4C4C4"/>
        <rbtc-input-amount :enableButton="!isReadyToSign"/>
        <v-divider color="#C4C4C4"/>
        <div class="form-step pb-0 pt-3 mb-3">
          <v-row class="mx-0 align-start">
            <v-col cols="auto" class="pl-0">
              <div v-bind:class="[focus ?
              'number-filled' : 'number']">3</div>
            </v-col>
            <v-col class="pl-0 ma-0 pb-0">
              <p v-bind:class="{'boldie': focus}">
                (Optional) Verify your Bitcoin destination address:
              </p>
              <v-row class="ma-0 mt-2 pa-0">
                <v-col v-if="session.btcDerivedAddress" cols="7" class="p-0">
                  <div class="container">
                    <v-row class="mx-0">
                      <span>Address derived</span>
                    </v-row>
                    <v-row class="mx-0 d-flex align-center">
                      <p class="mb-0 account">
                        {{session.btcDerivedAddress}}
                      </p>
                    </v-row>
                  </div>
                </v-col>
                <v-col v-else cols="4" class="pb-0 px-0">
                  <v-row class="derive-button ml-1 mx-0 d-flex justify-center">
                    <v-btn :disabled="!isReadyToSign ||
                      injectedProvider == appConstants.RLOGIN_LIQUALITY_WALLET"
                      outlined rounded id="derivation-addr-btn"
                      width="100%" height="38"
                      @click="openAddressDialog" >
                      <span>
                        Get Bitcoin destination address
                      </span>
                    </v-btn>
                  </v-row>
                </v-col>
                <v-container v-if="injectedProvider === appConstants.RLOGIN_LIQUALITY_WALLET"
                  style="font-size: 14px;">
                  <div>
                    As you are using Liquality, you need to follow
                    <a :href=appConstants.RSK_PEGOUT_DOCUMENTATION_URL class="d-inline blackish a"
                        target='_blank'> this documentation</a> to get the destination address.
                  </div>
                </v-container>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col cols="4" lg="4">
        <tx-summary-fixed
          :summary="pegOutFormSummary"
          :initialExpand="true"
          :type="typeSummary"
          :orientation="orientationSummary"/>
      </v-col>
    </v-row>
    <v-row v-if="showAddressDialog">
      <address-dialog @switchDeriveButton="switchDeriveButton"
       @closeDialog="closeAddressDialog"/>
    </v-row>
    <v-row class="mx-0">
      <v-col cols="2" class="d-flex justify-start ma-0 pa-0">
        <v-btn @click="back"
        rounded outlined color="#000000" width="110"
                :disabled="pegOutFormState.matches(['loading', 'goingHome'])">
          <span>Back</span>
        </v-btn>
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0 pl-0" >
        <v-btn v-if="!pegOutFormState.matches(['loading'])" rounded color="#000000"
                @click="send" id="send-btn"
                :disabled="!isReadyToCreate || pegOutFormState.matches(['goingHome'])">
          <span class="whiteish">Send</span>
          <v-icon class="ml-2" color="#fff">mdi-send-outline</v-icon>
        </v-btn>
        <v-progress-circular v-if="pegOutFormState.matches(['loading'])"
                              indeterminate color="#000000" class="mr-10"/>
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
import AddressDialog from '@/components/pegout/AddressDialog.vue';
import { TxStatusType } from '@/types/store';
import { Machine } from '@/services/utils';
import { TxSummaryOrientation } from '@/types/Status';
import { Action, Getter, State } from 'vuex-class';
import * as constants from '@/store/constants';
import TxErrorDialog from '@/components/exchange/TxErrorDialog.vue';
import {
  NormalizedSummary, PegOutTxState, SatoshiBig, SessionState, WeiBig,
} from '@/types';
import TxSummaryFixed from '@/components/exchange/TxSummaryFixed.vue';

@Component({
  components: {
    AddressDialog,
    RbtcInputAmount,
    RskWalletConnection,
    TxSummaryFixed,
    TxErrorDialog,
  },
})
export default class PegOutForm extends Vue {
  pegOutFormState: Machine<'loading' | 'goingHome' | 'fill'> = new Machine('fill');

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  injectedProvider = '';

  appConstants = constants;

  recipientAddress = '';

  showAddressDialog = false;

  focus = false;

  nextPage = 'Confirmation';

  typeSummary = TxStatusType.PEGOUT;

  orientationSummary = TxSummaryOrientation.VERTICAL;

  showTxErrorDialog = false;

  txError = '';

  isReadyToSign = false;

  tourSteps = [
    {
      target: '#wallet-connection',
      content: `Click to select the Rootstock wallet where your ${this.environmentContext.getRbtcTicker()} are stored`,
      params: {
        highlight: true,
        isFirst: true,
      },
    },
    {
      target: '#amount-field',
      content: `Input the amount you want to convert into ${this.environmentContext.getBtcTicker()}`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#max-btn',
      content: 'Click here if you want to send all the available balance in your wallet.',
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#derivation-addr-btn',
      content: 'If you want to derive your destination address click here and sign the message',
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-sender-address',
      content: `This is the address in Rootstock where the ${this.environmentContext.getRbtcTicker()} will be transferred from`,
      params: {
        highlight: true,
        isLast: true,
      },
    },
    {
      target: '#summary-amount',
      content: `This is the amount you will send to convert into ${this.environmentContext.getBtcTicker()}`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-tx-fee',
      content: `The estimated fee required by the network in ${this.environmentContext.getBtcTicker()}. Also called <strong>gas</strong> `,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-btc-destination',
      content: `This is the address where the ${this.environmentContext.getBtcTicker()} will be sent`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-estimated-fee',
      content: `The estimated fee required by the protocol in ${this.environmentContext.getBtcTicker()}`,
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#summary-btc-estimated-amount',
      content: 'Based on the estimated fee and the amount transferred, this is the estimated final amount that will be transferred to the destination address.',
      params: {
        highlight: true,
        isLast: false,
      },
    },
    {
      target: '#send-btn',
      content: 'When the form fields were fill, click to sign the transaction',
      params: {
        highlight: true,
        isLast: true,
      },
    },
  ];

  tourCallBacks = {
    onFinish: () => localStorage.setItem('ONBOARDED_USER_PEGOUT', 'true'),
  };

  @State('web3Session') session !: SessionState;

  @State('pegOutTx') pegOutTxState !: PegOutTxState;

  @Action(constants.PEGOUT_TX_SEND, { namespace: 'pegOutTx' }) sendTx !: () => Promise<void>;

  @Getter(constants.PEGOUT_TX_IS_ENOUGH_BALANCE, { namespace: 'pegOutTx' }) isEnoughBalance !: boolean;

  @Getter(constants.PEGOUT_TX_GET_SAFE_TX_FEE, { namespace: 'pegOutTx' }) safeFee !: WeiBig;

  @Getter(constants.PEGOUT_TX_GET_ESTIMATED_BTC_TO_RECEIVE, { namespace: 'pegOutTx' }) estimatedBtcToReceive !: SatoshiBig;

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

  switchDeriveButton(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.injectedProvider = this.session.rLoginInstance?.providerController.injectedProvider.name;
    //
    this.isReadyToSign = !this.isReadyToSign;
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
      && !!this.session.account;
  }

  get pegOutFormSummary(): NormalizedSummary {
    return {
      amountFromString: this.pegOutTxState.amountToTransfer.toRBTCTrimmedString(),
      amountReceivedString: this.estimatedBtcToReceive.toBTCTrimmedString(),
      fee: Number(this.pegOutTxState.btcEstimatedFee.toBTCTrimmedString()),
      recipientAddress: this.session.btcDerivedAddress,
      senderAddress: this.session.account,
      gas: Number(this.safeFee.toRBTCTrimmedString()),
    };
  }

  @Emit()
  closeTxErrorDialog() {
    this.showTxErrorDialog = false;
  }

  @Emit('changePage')
  changePage() {
    return this.nextPage;
  }

  mounted() {
    const newUser = localStorage.getItem('ONBOARDED_USER_PEGOUT') !== 'true';
    if (newUser) {
      this.$tours.pegOutTour.start();
    }
  }
}
</script>
