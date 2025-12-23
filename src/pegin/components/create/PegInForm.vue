<template>
  <v-container class="form">
    <v-row no-gutters class="d-flex justify-start">
      <v-btn variant="text"
      class="px-0"
      :prepend-icon="mdiArrowLeft"
      @click="back"
      :disabled="pegInFormState.matches(['loading', 'goingHome'])">
        Go Back
      </v-btn>
    </v-row>
    <v-row no-gutters class="d-flex justify-center">
      <v-col />
      <v-col xs="10" sm="8" md="7" lg="5" xl="5" class="d-flex space-between flex-column">
        <btc-input class="mb-8" @valid-amount="checkValidAmount"
          :flyoverAvailable="isFlyoverAvailable" />
        <rsk-destination-address class="mb-8" @valid-address="checkValidAddress"
          :is-amount-filled="validAmount"/>
        <btc-fee-select class="mb-8" />
      </v-col>
      <v-col />
    </v-row>
    <v-row no-gutters class="d-flex justify-center">
      <v-col />
      <v-col xs="10" sm="8" md="7" lg="5" xl="5" class="d-flex space-between flex-column">
        <template v-if="showOptions">
          <v-row no-gutters class="my-4">
            <span class="text-body-sm">Select mode to see exact amounts</span>
          </v-row>
          <v-row no-gutters v-if="(!flyoverIsEnabled
                    || peginQuotes.length === 0)
                    || !enoughAmountFlyover">
            <pegin-option-card :option-type="peginType.FLYOVER" flyover-not-available>
              <template v-slot>
                <h4 v-if="countdown === recaptchanNewTokenTime">
                  <span class="text-orange">Fast Mode</span> is unavailable at this time.
                </h4>
                <h4 v-else>
                  Fast mode will be <br> available in
                  <span class="text-orange">{{ countdown }} seconds.</span>
                </h4>
              </template>
            </pegin-option-card>
          </v-row>
          <v-row no-gutters v-if="flyoverIsEnabled
            && peginQuotes.length === 0 && enoughAmountFlyover">
            <pegin-option-card :option-type="peginType.FLYOVER" flyover-not-available>
              <template v-slot>
                <h4 v-if="countdown === recaptchanNewTokenTime && enoughFlyoverLiquidity">
                  <span class="text-orange">Fast Mode</span> no quotes available for this amount.
                </h4>
                <h4 v-else-if="!enoughFlyoverLiquidity">
                  <span class="text-orange">Fast Mode</span>
                  There is not enough liquidity for this amount.
                  <a href="mailto:flyover@rootstocklabs.com?subject=Insufficient Liquidity">
                    Contact support</a> if you want to use the fast mode.
                </h4>
              </template>
            </pegin-option-card>
          </v-row>
          <v-row no-gutters v-else-if="countdown === recaptchanNewTokenTime
                          && peginQuotes.length > 0"
            v-for="(quote, index) in peginQuotes" :key="index">
            <pegin-option-card
              :option-type="peginType.FLYOVER"
              @selected-option="changeSelectedOption"
              :selected="selected === peginType.FLYOVER"
              :quote="quote" />
          </v-row>
          <v-row no-gutters class="mt-4">
            <pegin-option-card
              :option-type="peginType.POWPEG"
              @selected-option="changeSelectedOption"
              :selected="selected === peginType.POWPEG"
            />
          </v-row>
          <v-row no-gutters class="d-flex justify-end mt-5">
            <v-col v-if="selected === peginType.FLYOVER">
              <v-btn-rsk v-if="!pegInFormState.matches(['loading']) && !toQr"
                @click="sendTx(true)"
                :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome'])"
                class="align-self-start text-body-1"
                >
                <template #append>
                  <v-icon :icon="mdiQrcode" />
                </template>
                  Send with
              </v-btn-rsk>
              <v-progress-circular class="align-self-end" v-else indeterminate />
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn-rsk v-if="!pegInFormState.matches(['loading'])"
                @click="sendTx(false)"
                :disabled="!isReadyToCreate || pegInFormState.matches(['goingHome']) || toQr"
                class="align-self-end text-body-1">
                <template #append>
                  <v-icon :icon="mdiArrowRight" />
                </template>
                Continue to Summary
              </v-btn-rsk>
              <v-progress-circular class="align-self-end" v-else indeterminate />
            </v-col>
          </v-row>
        </template>
        <v-row no-gutters v-else-if="loadingQuotes" class="justify-center">
          <v-progress-circular
            :size="250"
            :width="18"
            color="warning"
            indeterminate>
            Searching Options...
          </v-progress-circular>
        </v-row>
      </v-col>
      <v-col />
    </v-row>
    <div id="recaptcha" class="g-recaptcha"
      :data-sitekey="flyoverService.siteKey"
      data-callback="onRecaptchaSuccess"
      data-action="submit"
      data-size="invisible"></div>
    <template v-if="showErrorDialog">
      <full-tx-error-dialog
      :showTxErrorDialog="showErrorDialog"
      :error="txError"
      @closeErrorDialog="showErrorDialog = false"
      />
    </template>
  </v-container>
</template>

<script lang="ts">
import {
  computed, ref, defineComponent, onBeforeMount, watch, onMounted,
} from 'vue';
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiSendOutline,
  mdiQrcode,
} from '@mdi/js';
import BtcInput from '@/pegin/components/create/BtcInput.vue';
import PeginOptionCard from '@/pegin/components/create/PeginOptionCard.vue';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import {
  appendRecaptcha, Machine, ServiceError,
} from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import {
  FlyoverPeginState, LiquidityProvider2WP, PeginQuote, QuotePegIn2WP, SatoshiBig, WeiBig,
} from '@/common/types';
import {
  useAction, useGetter, useState, useStateAttribute,
} from '@/common/store/helper';
import BtcFeeSelect from '@/pegin/components/create/BtcFeeSelect.vue';
import { BridgeService } from '@/common/services/BridgeService';
import { FlyoverService } from '@/common/services';
import FullTxErrorDialog from '@/common/components/exchange/FullTxErrorDialog.vue';
import RskDestinationAddress from '@/pegin/components/create/RskDestinationAddress.vue';
import { AcceptedQuote } from '@rsksmart/flyover-sdk';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PegInForm',
  props: {
    isFlyoverAvailable: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    BtcInput,
    RskDestinationAddress,
    PeginOptionCard,
    BtcFeeSelect,
    FullTxErrorDialog,
  },
  emits: ['back', 'createTx'],
  setup(props, context) {
    const pegInFormState = ref<Machine<'loading' | 'goingHome' | 'fill'>>(new Machine('fill'));
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const loadingQuotes = ref(false);
    const selected = ref<constants.peginType | null>(null);
    const selectedQuote = ref<PeginQuote>();
    const showErrorDialog = ref(false);
    const txError = ref<ServiceError>(new ServiceError('', '', '', ''));
    const enoughFlyoverLiquidity = ref(true);
    const account = useStateAttribute<string>('web3Session', 'account');
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const flyoverPeginState = useState<FlyoverPeginState>('flyoverPegin');
    const refundAddress = useGetter<string>('pegInTx', constants.PEGIN_TX_GET_REFUND_ADDRESS);
    const enoughBalanceSelectedFee = useGetter<boolean>('pegInTx', constants.PEGIN_TX_GET_ENOUGH_FEE_VALUE);
    const isEnoughBalance = useGetter<boolean>('pegInTx', constants.PEGIN_TX_IS_ENOUGH_BALANCE);
    const getPeginQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_GET_QUOTES);
    const setSelectedQuote = useAction('flyoverPegin', constants.FLYOVER_PEGIN_ADD_SELECTED_QUOTE);
    const clearQuotes = useAction('flyoverPegin', constants.FLYOVER_PEGIN_CLEAR_QUOTES);
    const acceptQuote = useAction<AcceptedQuote>('flyoverPegin', constants.FLYOVER_PEGIN_ACCEPT_QUOTE);
    const getAvailableLiquidity = useAction('flyoverPegin', constants.FLYOVER_PEGIN_GET_AVAILABLE_LIQUIDITY);
    const liquidityProviders = useStateAttribute<LiquidityProvider2WP[]>('flyoverPegin', 'liquidityProviders');
    const quotes = useStateAttribute<Record<number, QuotePegIn2WP[]>>('flyoverPegin', 'quotes');
    const setPeginType = useAction('pegInTx', constants.PEGIN_TX_ADD_PEGIN_TYPE);
    const flyoverService = useStateAttribute<FlyoverService>('flyoverPegin', 'flyoverService');
    const selectedFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const selectedAccountBalance = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SELECTED_BALANCE);
    const loadingFee = useStateAttribute<boolean>('pegInTx', 'loadingFee');
    const startCountdown = useAction('web3Session', constants.SESSION_COUNTDOWN_GRECAPTCHA_TIME);
    const countdown = useStateAttribute<number>('web3Session', 'grecaptchaCountdown');
    const recaptchanNewTokenTime = EnvironmentAccessorService.getEnvironmentVariables()
      .grecaptchaTime;
    const toQr = ref(false);
    const router = useRouter();

    const sendingPegin = computed(():boolean => pegInFormState.value.matches(['loading']));

    const peginQuotes = computed(() => {
      if (!props.isFlyoverAvailable) {
        return [];
      }
      const quoteList: QuotePegIn2WP[] = [];
      Object.values(quotes.value).forEach((providerQuotes) => {
        providerQuotes.forEach((quote) => {
          quoteList.push(quote);
        });
      });
      return quoteList;
    });

    const flyoverIsEnabled = computed(() => {
      if (props.isFlyoverAvailable) {
        if (sendingPegin.value) return true;
        return countdown.value === recaptchanNewTokenTime;
      }
      return false;
    });

    const enoughAmountFlyover = computed(() => {
      const [providerQuote] = peginQuotes.value as PeginQuote[];
      if (!providerQuote) {
        return false;
      }
      const fullAmount: SatoshiBig = providerQuote.getTotalTxAmount(selectedFee.value);
      return selectedAccountBalance.value?.gte(fullAmount);
    });

    function back() {
      pegInFormState.value.send('loading');
      clearQuotes();
      router.push({ name: 'Home' });
    }

    function handleError(error: Error) {
      if (error instanceof ServiceError) {
        txError.value = error;
        showErrorDialog.value = true;
      }
    }

    async function createTx() {
      pegInFormState.value.send('loading');
      const bridgeService = new BridgeService();
      if (selected.value === constants.peginType.POWPEG) {
        context.emit('createTx', {
          amountToTransferInSatoshi: pegInTxState.value.amountToTransfer,
          refundAddress: refundAddress.value,
          recipient: pegInTxState.value.rskAddressSelected || account.value,
          feeLevel: pegInTxState.value.selectedFee,
          accountType: pegInTxState.value.selectedAccount,
          btcRecipient: await bridgeService.getFederationAddress(),
          peginType: constants.peginType.POWPEG,
        });
      } else {
        startCountdown();
        acceptQuote()
          .then((acceptedQuote) => {
            if (toQr.value) {
              router.push({ name: 'QrView', params: { network: constants.QRCodeNetworks.BITCOIN } });
            } else {
              context.emit('createTx', {
                amountToTransferInSatoshi: selectedQuote.value?.valueToTransfer,
                refundAddress: '',
                recipient: '',
                feeLevel: pegInTxState.value.selectedFee,
                accountType: pegInTxState.value.selectedAccount,
                btcRecipient: acceptedQuote.bitcoinDepositAddressHash,
                peginType: constants.peginType.FLYOVER,
              });
            }
          }).catch(handleError);
      }
      pegInFormState.value.send('fill');
    }

    async function changeSelectedOption(
      selectedType: constants.peginType | null,
      quote?: PeginQuote,
    ) {
      selected.value = selectedType;
      await setPeginType(selected.value);
      selectedQuote.value = quote;
      setSelectedQuote(quote?.quoteHash);
    }

    async function getQuotes() {
      loadingQuotes.value = true;
      getPeginQuotes({
        rootstockRecipientAddress: flyoverPeginState.value.rootstockRecipientAddress,
      })
        .finally(() => {
          loadingQuotes.value = false;
        });
    }

    function enoughLiquidityForThisAmount(amount: WeiBig) {
      return liquidityProviders.value.some((provider) => {
        const { liquidityCheckEnabled, pegin: { availableLiquidity } } = provider;
        return liquidityCheckEnabled && availableLiquidity?.gt(amount);
      });
    }

    const validAmount = ref(false);
    const amount = ref();
    const validAddress = ref(Boolean(account.value));
    const address = ref();

    const showOptions = computed(() => !loadingQuotes.value
    && !loadingFee.value && validAddress.value && validAmount.value);

    function checkValidAddress(isValid: boolean, addressInformed: string) {
      validAddress.value = isValid;
      if (isValid && addressInformed !== address.value) {
        address.value = addressInformed;
      }
    }

    function checkValidAmount(isValid: boolean, amountInformed: string) {
      validAmount.value = isValid;
      if (isValid && amountInformed !== amount.value) {
        amount.value = amountInformed;
      }
    }

    watch([amount, validAmount, address, validAddress], async () => {
      if (!validAmount.value || !validAddress.value) {
        return;
      }
      enoughFlyoverLiquidity.value = enoughLiquidityForThisAmount(new WeiBig(amount.value, 'rbtc'));
      if (!enoughFlyoverLiquidity.value) {
        await clearQuotes();
        return;
      }
      await changeSelectedOption(null);
      await getQuotes();
    });

    const isReadyToCreate = computed((): boolean => {
      if (!showOptions.value) {
        return false;
      }

      if (selected.value === constants.peginType.POWPEG) {
        return isEnoughBalance.value
        && !pegInTxState.value.loadingFee
        && !!pegInTxState.value.rskAddressSelected
        && pegInTxState.value.rskAddressSelected !== '0x'
        && enoughBalanceSelectedFee.value;
      }

      if (selected.value === constants.peginType.FLYOVER) {
        return enoughAmountFlyover.value
          && !!flyoverPeginState.value.selectedQuoteHash
          && !!flyoverPeginState.value.rootstockRecipientAddress
          && flyoverPeginState.value.rootstockRecipientAddress !== '0x'
          && countdown.value === recaptchanNewTokenTime;
      }

      return false;
    });

    function sendTx(sendToQr:boolean) {
      toQr.value = sendToQr;
      if (props.isFlyoverAvailable && selected.value === constants.peginType.FLYOVER) {
        window.grecaptcha.execute();
      } else {
        createTx();
      }
    }

    onBeforeMount(() => {
      if (props.isFlyoverAvailable) {
        window.onRecaptchaSuccess = createTx;
      }
    });

    onMounted(() => {
      if (props.isFlyoverAvailable) {
        appendRecaptcha(flyoverService.value.siteKey);
      }
    });

    if (props.isFlyoverAvailable) {
      getAvailableLiquidity();
    }

    return {
      pegInFormState,
      environmentContext,
      back,
      isReadyToCreate,
      pegInTxState,
      createTx,
      mdiSendOutline,
      mdiArrowLeft,
      mdiArrowRight,
      changeSelectedOption,
      selected,
      showOptions,
      loadingQuotes,
      getQuotes,
      peginQuotes,
      peginType: constants.peginType,
      showErrorDialog,
      txError,
      handleError,
      flyoverService,
      checkValidAmount,
      checkValidAddress,
      validAmount,
      validAddress,
      sendTx,
      flyoverIsEnabled,
      countdown,
      recaptchanNewTokenTime,
      mdiQrcode,
      toQr,
      enoughFlyoverLiquidity,
      enoughAmountFlyover,
    };
  },
});
</script>
