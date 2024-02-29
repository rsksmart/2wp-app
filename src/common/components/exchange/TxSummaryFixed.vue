<template>
  <v-container v-if="type && orientation" class="pa-0 ma-0">
    <v-row class="ma-0 py-4 d-flex justify-center">
      <h2 class="text-center tx-text">
        Operation summary
      </h2>
    </v-row>
    <v-row v-if="orientation === orientationTypes.HORIZONTAL"
           class="mx-0 d-flex justify-center">
      <v-col sm="10"
             md="9"
             lg="8"
             xl="7">
        <div class="box-pegin box">
          <v-row>
            <v-col class="box-col bitcoin-col" cols="6">
              <v-row class="status-title pl-4 pt-6">
                <span>{{ fromTitle }}</span>
              </v-row>

              <!-- refundAddress -->
              <v-row v-if="!!summary.refundAddress" class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Refund Address</span>
                    <v-tooltip>
                      <template v-slot:activator="{ props }">
                        <v-btn icon size="small" variant="plain" v-bind="props" density="compact">
                          <v-icon class="tooltip-info-icon" size="small" :icon="mdiInformation">
                          </v-icon>
                        </v-btn>
                      </template>
                        <p class="tooltip-form mb-0">
                          Rejected transactions will be refunded to this
                          {{environmentContext.getBtcText()}} address.
                        </p>
                    </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row>
                        <v-col cols="12"
                               class="col-address-button d-flex flex-column justify-end">
                          <span class="breakable-address status-text-ellipsis">
                            {{ computedRefundAddress }}
                          </span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- Sender -->
              <v-row v-if="!!summary.senderAddress || summary.selectedAccount"
                     class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">
                      {{ type === txType.PEGOUT ? 'Sender address' : 'Device account' }}
                    </span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row v-if="type === txType.PEGOUT" class="justify-end align-center">
                        <v-col cols="11" class="col-address-button d-flex flex-column">
                          <tx-summary-field
                            textStyles="breakable-address status-text-ellipsis"
                            :textValue="senderValue"
                            id="senderAddress"
                            @copyToClipboard="copyToClipboard"
                          />
                        </v-col>
                        <v-col cols="1" class="col-address-button pa-0">
                          <v-btn @click="openAddressInExplorer" icon
                              density="compact"
                              size="small"
                              variant="plain">
                            <v-icon :icon="mdiOpenInNew"></v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                      <span v-else class="breakable-address status-text-ellipsis">
                        {{ senderValue }}
                      </span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- sent -->
              <v-row class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Sent</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="ma-0">
                        <span id="amount">
                          {{ amount }} {{ currencyFromTicker }}
                        </span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- PowPeg Address -->
              <v-row v-if="summary.federationAddress" class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">PowPeg Address</span>
                  <v-tooltip>
                    <template v-slot:activator="{ props }">
                      <v-btn icon size="small" variant="plain" v-bind="props" density="compact">
                        <v-icon class="tooltip-info-icon" size="small" :icon="mdiInformation">
                        </v-icon>
                      </v-btn>
                    </template>
                    <p class="tooltip-form mb-0">
                        This is the {{ environmentContext.getBtcText() }}
                        address where your {{ environmentContext.getBtcTicker() }}s
                        are sent for conversion.
                    </p>
                    <p class="tooltip-form mb-0">
                        Validate this in your device before
                        confirming the transaction.
                    </p>
                  </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <tx-summary-field
                        textStyles="status-text-ellipsis"
                        :textValue="federationAddress"
                        id="federationAddress"
                        @copyToClipboard="copyToClipboard"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- transaction hash -->
              <v-row v-if="summary.txId" class="box-field mx-1">
                <v-col>
                  <v-row>
                    <span class="status-subtitle">Transaction hash</span>
                    <v-tooltip>
                        <template v-slot:activator="{ props }">
                          <v-btn icon size="small"
                                variant="plain" v-bind="props" density="compact">
                            <v-icon class="tooltip-info-icon" size="small" :icon="mdiInformation">
                            </v-icon>
                          </v-btn>
                          </template>
                          <p class="tooltip-form mb-0">
                            Verify the transaction on {{networkFromText}} block explorer.
                          </p>
                      </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end align-center">
                        <v-col cols="11"
                               class="col-address-button d-flex flex-column">
                          <tx-summary-field
                            textStyles="breakable-address status-text-ellipsis"
                            @copyToClipboard="copyToClipboard"
                            id="txId"
                            :textValue="summary.txId"
                            />
                        </v-col>
                        <v-col cols="1" class="col-address-button pa-0">
                          <v-btn @click="openExplorerTx" icon density="compact"
                              size="small"
                              variant="plain">
                            <v-icon :icon="mdiOpenInNew"></v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

            </v-col>

            <v-divider inset vertical/>

            <v-col class="box-col rsk-col" cols="6">
              <v-row class="status-title justify-end pr-4 pt-6">
                <span>{{ toTitle }}</span>
              </v-row>

              <!-- Recipient -->
              <v-row class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                    <span class="status-subtitle">Recipient</span>
                    <v-tooltip>
                        <template v-slot:activator="{ props }">
                          <v-btn icon size="small" variant="plain" v-bind="props" density="compact">
                            <v-icon v-if="recipientAddress === '-'"
                                  class="tooltip-clickable-icon"
                                  size="small"
                                  :icon="mdiInformation"
                                  @click="openDerivationAddressDocumentation">
                            </v-icon>
                            <v-icon v-else
                                  class="tooltip-info-icon"
                                  size="small"
                                  :icon="mdiInformation">
                            </v-icon>
                          </v-btn>
                          </template>
                          <p class="tooltip-form mb-0">
                            This is the {{networkToText}} destination address
                            where the {{networkToText}} will be delivered.
                          </p>
                          <p v-if="recipientAddress === '-'" class="tooltip-form mb-0">
                            Click here to know how to get it.
                          </p>
                      </v-tooltip>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end align-center">
                        <v-col cols="11" class="col-address-button d-flex flex-column text-right ">
                          <tx-summary-field v-if="recipientAddress  !== '-'"
                            @copyToClipboard="copyToClipboard"
                            textStyles="breakable-address status-text-ellipsis"
                            id="recipientAddress"
                            :textValue="recipientAddress"
                          />
                          <span v-else textStyles="breakable-address status-text-ellipsis">
                            -
                          </span>
                        </v-col>
                        <v-col v-if="recipientAddress !== '-'" cols="1"
                          class="col-address-button pa-0">
                          <v-btn @click="openExplorerToAddress" icon
                          density="compact"
                          size="small" variant="plain">
                            <v-icon color="#000000" :icon="mdiOpenInNew"></v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- will receive -->
              <v-row v-if="summary.amountReceivedString !== '0' || isRejected"
                class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                    <span class="status-subtitle">Will receive</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end ma-0">
                        <span>{{ amountToReceive }}</span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- Fee -->
              <v-row class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                    <span class="status-subtitle" id="summary-horizontal-title-fee">
                      {{ summary.fee
                        ? ($route.params.type === 'flyover' ? 'Network fee' : 'Fee')
                        : 'Estimated fee'
                      }}
                    </span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end ma-0">
                        <span id="summary-horizontal-value-fee">{{ safeFeeString === '0' ? '-'
                          : safeFeeString + ' ' + environmentContext.getBtcTicker() }}
                        </span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- Total -->
              <v-row v-if="type === txType.PEGIN" class="box-field mx-1">
                <v-col>
                  <v-row class="justify-end">
                    <span class="status-subtitle">Total</span>
                  </v-row>
                  <v-row>
                    <v-col class="form-field-summary">
                      <v-row class="justify-end ma-0">
                        <span>{{ total }} {{ currencyFromTicker }}</span>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>

          </v-row>
          <v-row v-if="releasedPegout" class="mx-1 mt-6">
            <span class="next-steps">
              Next steps: Click
              <a :href="appConstants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL"
                class="d-inline text-decoration-underline font-weight-bold"
                target="_blank">here</a>
              to learn how to get your Bitcoins
            </span>
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="orientation === orientationTypes.VERTICAL"
           class="ma-0 pa-6 summary-box">
      <!-- Top section -->
      <v-container class="pa-0">
        <v-row class="ma-0 mb-2">
          <h2 id="summary-title-from">{{fromTitle}}</h2>
        </v-row>

        <!-- Sender -->
        <v-container class="px-0 py-2">
          <v-row class="ma-0">
            <h1 class="boldie">
              {{ type === txType.PEGOUT ? 'Sender address' : accountLabel }}
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish">{{ senderValue }}</p>
            </v-container>
          </div>
        </v-container>

        <!-- Refund -->
        <v-container v-if="summary.refundAddress"
                     class="px-0 py-2">
          <v-row class="ma-0">
            <h1 class="boldie">Refund address</h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish">
                {{ refundAddress }}
              </p>
            </v-container>
          </div>
        </v-container>

        <!-- Amount -->
        <v-container class="px-0 py-2">
          <v-row class="ma-0">
            <h1 class="boldie">
              Amount
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish">
                {{ amount }} {{ currencyFromTicker }}
              </p>
              <span>USD {{ amountUSD }}</span>
            </v-container>
          </div>
        </v-container>

        <!-- Fee PEGIN -->
        <v-container v-if="type === txType.PEGIN" class="px-0 py-2">
          <v-row class="ma-0">
            <h1 class="boldie">
             Transaction fee
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish">
                {{ summary.fee }}
                {{ currencyFromTicker }}
              </p>
              <span>USD {{ feeUSD }}</span>
            </v-container>
          </div>
        </v-container>

        <!-- Total -->
        <v-container  v-if="type === txType.PEGIN" class="px-0 pt-2 pb-4">
          <v-row class="ma-0">
            <h1 class="boldie">
              Transaction total
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish">
                {{ total }} {{currencyFromTicker}}
              </p>
              <span>USD {{ totalUSD }}</span>
            </v-container>
          </div>
        </v-container>

        <!-- Gas -->
        <v-container v-if="type === txType.PEGOUT" class="px-0 py-2">
          <v-row class="ma-0">
            <h1 class="boldie">Gas</h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish">
                {{ summary.gas }} {{currencyFromTicker}}
              </p>
              <span v-if="type === txType.PEGOUT">USD {{ gasUSD }}</span>
            </v-container>
          </div>
        </v-container>
        <v-divider />
      </v-container>

      <!-- Bottom section -->
      <v-container class="pa-0 pt-4">
        <v-container class="pa-0">
          <v-row class="ma-0 mb-2 justify-end">
            <h2>{{ toTitle }}</h2>
          </v-row>
        </v-container>

        <!-- Recipient -->
        <v-container class="px-0 py-2">
          <v-row class="justify-end ma-0">
            <h1 class="boldie">
              {{ type === txType.PEGOUT ?
              'Recipient address'
              : environmentContext.getRbtcTicker() + ' destination address' }}
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish text-end">
                {{ recipientAddress }}
              </p>
            </v-container>
          </div>
        </v-container>

        <!-- Fee PEGOUT -->
        <v-container v-if="type === txType.PEGOUT" class="px-0 py-2">
          <v-row class="justify-end ma-0">
            <h1 class="boldie">
             Estimated fee to pay
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish text-end">
                {{ summary.fee }}
                {{ currencyToTicker }}
              </p>
              <p class="p_usd text-end">USD {{ safeFeeUSD }}</p>
            </v-container>
          </div>
        </v-container>

        <!-- Estimated BTC to receive -->
        <v-container v-if="type === txType.PEGOUT" class="px-0 py-2">
          <v-row class="justify-end ma-0">
            <h1 class="boldie">
              Estimated {{environmentContext.getBtcTicker()}} to receive
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0">
              <p class="light-grayish text-end">
                {{ summary.amountReceivedString }} {{currencyToTicker}}
              </p>
              <p class="p_usd text-end">USD {{ estimatedToReceiveUSD }}</p>
            </v-container>
          </div>
        </v-container>

        <!-- Pegin RBTC to receive -->
        <v-container  v-if="type === txType.PEGIN" class="pa-0 pt-2">
          <v-row class="justify-end ma-0">
            <h1 class="boldie">
               {{environmentContext.getRbtcTicker()}} to receive
            </h1>
          </v-row>
          <div class="form-field pt-2 pl-0">
            <v-container class="pa-0 text-end" id="summary-btc-estimated-amount">
              <p class="light-grayish">
                {{ amount }}  {{currencyToTicker}}
              </p>
              <span>USD {{ amountUSD }}</span>
            </v-container>
          </div>
        </v-container>

      </v-container>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Big from 'big.js';
import {
  computed, ref, PropType, defineComponent,
} from 'vue';
import { mdiInformation, mdiOpenInNew } from '@mdi/js';
import {
  formatTxId, getBtcAddressExplorerUrl, getBtcTxExplorerUrl, getChunkedValue,
} from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import {
  NormalizedSummary,
  PegoutStatus,
  PegoutStatusDataModel,
  SatoshiBig,
  TxStatusType,
  TxSummaryOrientation,
} from '@/common/types';
import { useGetter, useStateAttribute } from '@/common/store/helper';
import TxSummaryField from '@/common/components/exchange/TxSummaryField.vue';

export default defineComponent({
  name: 'TxSummaryFixed',
  components: {
    TxSummaryField,
  },
  props: {
    initialExpand: Boolean,
    summary: {
      type: Object as PropType<NormalizedSummary>,
      required: true,
    },
    type: String as PropType<TxStatusType>,
    orientation: String as PropType<TxSummaryOrientation>,
    isRejected: Boolean,
  },
  setup(props) {
    const over = ref(false);
    const fixedUSDDecimals = 2;
    const VALUE_INCOMPLETE_MESSAGE = '-';
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const orientationTypes = TxSummaryOrientation;
    const txType = TxStatusType;
    const appConstants = constants;

    const bitcoinPrice = useStateAttribute<number>('web3Session', 'bitcoinPrice');
    const txDetails = useStateAttribute<PegoutStatusDataModel>('status', 'txDetails');
    const walletName = useGetter<string>('pegInTx', constants.WALLET_NAME);

    const releasedPegout = computed(() => txDetails.value?.status === PegoutStatus.RELEASE_BTC);

    const fromTitle = computed(() => (props.type === TxStatusType.PEGIN ? 'Bitcoin' : 'Rootstock'));

    const toTitle = computed(() => (props.type === TxStatusType.PEGIN ? 'Rootstock' : 'Bitcoin'));

    const computedRefundAddress = computed((): string => {
      let refundAddress = VALUE_INCOMPLETE_MESSAGE;
      if (props.summary?.refundAddress) {
        refundAddress = props.summary.refundAddress;
      }
      return refundAddress;
    });

    const accountLabel = computed((): string => {
      const isLedger = walletName.value === 'Trezor';
      const isTrezor = walletName.value === 'Ledger';
      if (isLedger || isTrezor) {
        return 'Device account';
      }
      return 'Sender account';
    });

    const currencyFromTicker = computed(() => (
      props.type === TxStatusType.PEGIN
        ? environmentContext.getBtcTicker()
        : environmentContext.getRbtcTicker()
    ));

    const currencyToTicker = computed(() => (
      props.type === TxStatusType.PEGIN
        ? environmentContext.getRbtcTicker()
        : environmentContext.getBtcTicker()
    ));

    const amount = computed(
      (): string => props.summary?.amountFromString || VALUE_INCOMPLETE_MESSAGE,
    );

    const amountToReceive = computed((): string => {
      if (!props.summary?.amountReceivedString || props.summary.amountReceivedString === '0') {
        return '-';
      }
      return `${props.summary.amountReceivedString} ${currencyToTicker.value}`;
    });

    const safeFee = computed((): number => {
      let fee = props.summary?.fee ?? 0;
      if (
        (!props.summary?.fee || props.summary.fee === 0)
          && props.type === TxStatusType.PEGOUT
          && props.summary?.estimatedFee
      ) {
        fee = props.summary.estimatedFee;
      }
      return fee;
    });

    const safeFeeString = computed(
      () => new SatoshiBig(safeFee.value.toString(), 'btc').toBTCTrimmedString(),
    );

    const total = computed((): string => {
      const amountFromProps = new Big(props.summary?.amountFromString || '0');
      const fee = new Big(safeFee.value);
      return amountFromProps.plus(fee).toString() || VALUE_INCOMPLETE_MESSAGE;
    });

    const amountUSD = computed((): string => {
      const btcAmount = new SatoshiBig(props.summary?.amountFromString || 0, 'btc');
      if (!btcAmount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      return btcAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const feeUSD = computed((): string => {
      const feeAmount = new SatoshiBig(props.summary?.fee || 0, 'btc');
      if (!feeAmount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      return feeAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const safeFeeUSD = computed((): string => {
      const feeAmount = new SatoshiBig(safeFee.value.toString() || 0, 'btc');
      if (!feeAmount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      return feeAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const estimatedToReceiveUSD = computed((): string => {
      const receiveAmount = new SatoshiBig(props.summary?.amountReceivedString || 0, 'btc');
      if (!receiveAmount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      return receiveAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const gasUSD = computed((): string => {
      const gasAmount = new SatoshiBig(props.summary?.gas || 0, 'btc');
      if (!gasAmount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      return gasAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const totalUSD = computed((): string => {
      const totalValue = total.value === VALUE_INCOMPLETE_MESSAGE ? 0 : total.value;
      const totalAmount = new SatoshiBig(totalValue, 'btc');
      if (!totalAmount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      return `${totalAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals)}`;
    });

    const federationAddress = computed((): string => (
      props.summary?.federationAddress
        ? formatTxId(props.summary.federationAddress)
        : VALUE_INCOMPLETE_MESSAGE));

    const networkFromText = computed((): string => {
      if (props.type === TxStatusType.PEGIN) {
        return environmentContext.getBtcText();
      }
      return environmentContext.getRskText();
    });

    const networkToText = computed((): string => {
      if (props.type === TxStatusType.PEGIN) {
        return environmentContext.getRskText();
      }
      return environmentContext.getBtcText();
    });

    const maxLengthForChunked = computed((): number => (
      props.orientation === TxSummaryOrientation.VERTICAL ? 15 : 25));

    const recipientAddress = computed(() => (
      (!props.summary?.recipientAddress || props.summary?.recipientAddress === '0x')
        ? '-'
        : getChunkedValue(props.summary.recipientAddress, maxLengthForChunked.value)));

    const refundAddress = computed((): string => (props.summary?.refundAddress
      ? getChunkedValue(props.summary.refundAddress, maxLengthForChunked.value)
      : VALUE_INCOMPLETE_MESSAGE));

    const senderValue = computed(():string => {
      if (props.summary?.senderAddress) {
        return getChunkedValue(props.summary.senderAddress, maxLengthForChunked.value);
      }
      if (props.summary?.selectedAccount) {
        return props.summary.selectedAccount;
      }
      return VALUE_INCOMPLETE_MESSAGE;
    });

    const explorerRSK = computed(() => {
      const network = EnvironmentAccessorService.getEnvironmentVariables().vueAppCoin === constants.BTC_NETWORK_MAINNET ? '' : '.testnet';
      return `https://explorer${network}.rootstock.io`;
    });

    function copyToClipboard(id: string) {
      if (id === 'txId' || id === 'federationAddress' || id === 'senderAddress' || id === 'recipientAddress') {
        navigator.clipboard.writeText(props.summary?.[id] || '');
      }
    }

    function openAddressInExplorer() {
      window.open(`${explorerRSK.value}/address/${props.summary?.senderAddress}`, '_blank');
    }

    function openExplorerTx() {
      const sanitizedTxId = props.summary?.txId?.startsWith('0x')
        ? props.summary?.txId?.substring(2, (props.summary?.txId?.length))
        : props.summary?.txId;
      if (props.type === TxStatusType.PEGIN) {
        window.open(getBtcTxExplorerUrl(sanitizedTxId || ''), '_blank');
      } else {
        window.open(`${explorerRSK.value}/tx/${props.summary?.txId}`, '_blank');
      }
    }

    function openExplorerToAddress() {
      if (props.type === TxStatusType.PEGIN) {
        window.open(`${explorerRSK.value}/address/${props.summary?.recipientAddress}`, '_blank');
      } else {
        window.open(getBtcAddressExplorerUrl(props.summary?.recipientAddress || ''), '_blank');
      }
    }

    function openDerivationAddressDocumentation() {
      window.open(`${appConstants.DERIVE_BTC_ADDRESS_DOCUMENTATION_URL}`);
    }

    return {
      over,
      VALUE_INCOMPLETE_MESSAGE,
      environmentContext,
      orientationTypes,
      txType,
      appConstants,
      fromTitle,
      toTitle,
      computedRefundAddress,
      currencyFromTicker,
      currencyToTicker,
      amount,
      amountToReceive,
      total,
      amountUSD,
      gasUSD,
      safeFeeUSD,
      estimatedToReceiveUSD,
      feeUSD,
      totalUSD,
      federationAddress,
      networkFromText,
      networkToText,
      recipientAddress,
      refundAddress,
      senderValue,
      safeFeeString,
      safeFee,
      copyToClipboard,
      openExplorerTx,
      openExplorerToAddress,
      openDerivationAddressDocumentation,
      mdiInformation,
      mdiOpenInNew,
      accountLabel,
      releasedPegout,
      openAddressInExplorer,
    };
  },
});
</script>
