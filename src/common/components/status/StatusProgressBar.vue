<template>
  <v-container class="statusBar mb-16 pa-0">
    <template v-if="!txNotFound">
      <v-row no-gutters class="mb-4 mx-4">
        <v-col cols="6">
          <span :class='`pa-1 bg-${type.color} text-left font-weight-bold`'>
            {{ type.label }}
          </span>
        </v-col>
        <v-col cols="6">
          <v-row no-gutters>
            <v-col class="mr-2">
              <v-row no-gutters class="d-flex justify-end">
                <span class="text-body-status">{{ statusSummary.label }}</span>
              </v-row>
              <template v-if="statusSummary.label !== TxStatusStep.FAILED">
                <v-row no-gutters class="d-flex justify-end">
                  <span class="text-body-time">{{ statusSummary.time }}</span>
                </v-row>
              </template>
            </v-col>
            <v-col cols="auto">
              <v-img class="d-flex flex-0-0" :src="statusSummary.icon"
                width="40" height="40" contain/>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-4">
        <v-col cols="2" class="d-flex justify-center pl-0">
          <v-img class="d-flex flex-0-0" :src="initialStepImage" width="48" height="48" contain/>
        </v-col>
        <v-col>
          <v-row no-gutters>
            <span class="text-body-amount">
              {{ sendedAmount }}
              <span class="text-body-ticker">{{ sendedAmountTicker }}</span>
            </span>
          </v-row>
          <v-row no-gutters>
            <span class="text-body-2 text-bw-500">
              {{ sendedAmountUSD }}{{ isPegOut ? 'Rootstock chain' : 'Bitcoin chain' }}
            </span>
          </v-row>
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-n2" style="height: 10%; bottom: 0;">
        <v-col cols="2" class="d-flex justify-center pa-0">
        <v-divider class="border-opacity-100" color="bw-600" vertical :thickness="2" />
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="2" class="d-flex justify-center align-center">
          <v-img :src="imgStep1" :width="10" :height="10" contain/>
        </v-col>
        <v-col class="pa-0">
          <v-row no-gutters>
            <v-col cols="auto">
              <template v-if="statusStep.index === 1">
                <v-progress-circular v-if="statusStep.label === TxStatusStep.IN_PROGRESS"
                  indeterminate :size="24" :width="2" class="mr-2" color="orange" />
                <v-img v-if="statusStep.label === TxStatusStep.FAILED"
                  class="d-flex flex-0-0 mr-2" :src="errorStepImg" width="24" height="24" contain/>
              </template>
              <v-img v-if="(statusStep.index > 1 && statusStep.label === TxStatusStep.IN_PROGRESS)
              || (statusStep.index > 1 && statusStep.label === TxStatusStep.COMPLETED)"
                class="d-flex flex-0-0 mr-2" :src="successStepImg" width="24" height="24" contain/>
            </v-col>
            <v-col>
              <span class="text-body-step">{{ firstLabel }}</span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <template v-if="statusStep.label !== TxStatusStep.FAILED">
        <v-row no-gutters class="mt-n2 mb-n2" style="height: 20%; bottom: 0;">
          <v-col cols="2" class="d-flex justify-center pa-0">
          <v-divider class="border-opacity-100" color="bw-600" vertical :thickness="2" />
          </v-col>
        </v-row>
        <v-row no-gutters >
          <v-col cols="2" class="d-flex justify-center align-center">
            <v-img :src="imgStep2" :width="10" :height="10" contain/>
          </v-col>
          <v-col class="pa-0">
            <v-row no-gutters>
              <v-col cols="auto">
                <template v-if="statusStep.label === TxStatusStep.IN_PROGRESS">
                  <v-progress-circular v-if="statusStep.index === 2"
                    indeterminate :size="24" :width="2" class="mr-2" color="orange" />
                  <v-img v-if="statusStep.index > 2" class="d-flex flex-0-0 mr-2"
                    :src="successStepImg" width="24" height="24" contain/>
                  <v-img v-if="statusStep.index < 2" class="d-flex flex-0-0 mr-2"
                    :src="exchangeStepImg" width="24" height="24" contain/>
                </template>
                <template v-if="statusStep.label === TxStatusStep.COMPLETED">
                  <v-img class="d-flex flex-0-0 mr-2"
                    :src="successStepImg" width="24" height="24" contain/>
                </template>
              </v-col>
              <v-col>
                <span class="text-body-step">
                  Exchanging {{ sendedAmountTicker }} to {{ receivedAmountTicker }}
                </span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </template>
      <template v-if="statusStep.label !== TxStatusStep.FAILED">
        <v-row no-gutters class="mt-n2 mb-n2" style="height: 20%; bottom: 0;">
          <v-col cols="2" class="d-flex justify-center pa-0">
          <v-divider class="border-opacity-100" color="bw-600" vertical :thickness="2" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col cols="2" class="d-flex justify-center align-center">
            <v-img :src="imgStep3" :width="10" :height="10" contain/>
          </v-col>
          <v-col class="pa-0">
            <v-row no-gutters>
              <v-col cols="auto">
                <template v-if="statusStep.index >= 3">
                  <v-progress-circular v-if="statusStep.index === 3
                    && statusStep.label === TxStatusStep.IN_PROGRESS"
                    indeterminate :size="24" :width="2" class="mr-2"  color="orange" />
                  <v-img v-if="statusStep.index >= 3 && statusStep.label === TxStatusStep.COMPLETED"
                    class="d-flex flex-0-0 mr-2" :src="successStepImg" width="24" height="24"
                    contain/>
                </template>
                <v-img  v-if="statusStep.index < 3" class="d-flex flex-0-0 mr-2"
                  :src="finalStepImg" width="24" height="24" contain/>
              </v-col>
              <v-col>
                <span class="text-body-step">Sending funds to your wallet</span>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </template>
      <v-row no-gutters class="mt-n2" style="height: 10%; bottom: 0;">
        <v-col cols="2" class="d-flex justify-center pa-0">
        <v-divider class="border-opacity-100" color="bw-600" vertical :thickness="2" />
        </v-col>
      </v-row>
      <v-row no-gutters class="mt-4">
        <v-col cols="2" class="d-flex justify-center pl-0">
          <v-img class="d-flex flex-0-0" :src="finalStepImage" width="48" height="48" contain/>
        </v-col>
        <v-col>
          <v-row no-gutters>
            <span class="text-body-amount">
              {{ receivedAmount }}
              <span class="text-body-ticker">{{ receivedAmountTicker }}</span>
            </span>
          </v-row>
          <v-row no-gutters>
            <span class="text-body-2 text-bw-500">
              {{ receivedAmountUSD }}{{ isPegOut ? 'Bitcoin chain' : 'Rootstock chain' }}
            </span>
          </v-row>
        </v-col>
      </v-row>
   </template>
    <template v-if="statusStep.label === TxStatusStep.FAILED">
      <v-row no-gutters>
        <v-col class="mt-4 mx-4">
          <span class="text-body-reason">{{ rejectionMsg }}</span>
        </v-col>
      </v-row>
      <v-row no-gutters class="mb-n16">
        <v-col class="mx-4 mb-n16">
          <a class="text-body-reason font-weight-bold text-orange" target='_blank'
            href='https://discord.gg/rootstock' rel="noopener">
            Need help?
          </a>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useState, useStateAttribute } from '@/common/store/helper';
import {
  BtcPeginStatus,
  FlyoverStatusModel,
  PeginQuoteDTO2WP,
  PegoutQuoteDTO2WP,
  PeginStatus,
  PegoutStatus,
  PegoutStatusDataModel,
  RskPeginStatus,
  RskStatus,
  SatoshiBig,
  TxStatus,
  TxStatusStep,
  TxStatusType,
  WeiBig,
} from '@/common/types';
import { PegStatus, FlyoverStatus, PowPegMode } from '@/common/store/constants';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { blockConfirmationsToTimeString } from '@/common/utils';
import * as constants from '@/common/store/constants';

export default defineComponent({
  name: 'StatusProgressBar',
  props: {
    details: Object,
    isFlyover: Boolean,
    txNotFound: Boolean,
    txWithError: Boolean,
  },
  setup(props) {
    const status = useState<TxStatus>('status');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const btcTicker = environmentContext.getBtcTicker();
    const rbtcTicker = environmentContext.getRbtcTicker();

    const txFailed = computed(() => props.txWithError
      || status.value.flyoverStatus?.status === FlyoverStatus.FAILED);
    const txDetails = useStateAttribute<PegoutStatusDataModel|PeginStatus|FlyoverStatusModel>('status', 'txDetails');
    const isPegOut = computed((): boolean => status.value.type === TxStatusType.PEGOUT
      || status.value.type === TxStatusType.FLYOVER_PEGOUT);
    const bitcoinPrice = useStateAttribute<number>('pegInTx', 'bitcoinPrice');

    const sendedAmount = computed((): string => {
      if (isPegOut.value) {
        return props.details?.amountFromString ? `${props.details?.amountFromString} ` : '';
      }
      return props.details?.total ? `${props.details?.total} ` : '';
    });
    const receivedAmount = computed((): string => (props.details?.amountReceivedString
      ? `${props.details?.amountReceivedString} ` : ''));
    const sendedAmountTicker = computed((): string => (isPegOut.value ? rbtcTicker : btcTicker));
    const receivedAmountTicker = computed((): string => (isPegOut.value ? btcTicker : rbtcTicker));
    const sendedAmountUSD = computed((): string => {
      if (isPegOut.value) {
        return props.details?.amountFromString
          ? `${new WeiBig(props.details?.amountFromString, 'rbtc')
            .toUSDFromRBTCString(bitcoinPrice.value, 2)} USD | `
          : '';
      }
      return props.details?.total
        ? `${new SatoshiBig(props.details?.total, 'btc')
          .toUSDFromBTCString(bitcoinPrice.value, 2)} USD | `
        : '';
    });
    const receivedAmountUSD = computed((): string => (props.details?.amountReceivedString
      ? `${new SatoshiBig(props.details?.amountReceivedString, 'btc')
        .toUSDFromBTCString(bitcoinPrice.value, 2)} USD | `
      : ''));
    const type = computed((): { label: string, color: string} => (status
      .value.type === TxStatusType.PEGOUT || status.value.type === TxStatusType.PEGIN
      ? { label: PowPegMode.NATIVE, color: 'purple' }
      : { label: PowPegMode.FAST, color: 'orange' }));
    const initialStepImage = computed(() => {
      if (isPegOut.value) {
        return require('@/assets/status/rbtc.svg');
      }
      return require('@/assets/status/btc.svg');
    });
    const finalStepImage = computed(() => {
      if (isPegOut.value) {
        return require('@/assets/status/btc.svg');
      }
      return require('@/assets/status/rbtc.svg');
    });
    const statusStep = computed(() => {
      let label = TxStatusStep.EMPTY;
      let index = 0;
      if (props.txNotFound) {
        label = TxStatusStep.FAILED;
        index = 1;
      } else if (isPegOut.value) {
        if (props.isFlyover) { // Flyover PegOut
          switch (status.value.flyoverStatus?.status) {
            case FlyoverStatus.PENDING:
              label = TxStatusStep.IN_PROGRESS;
              index = 2;
              break;
            case FlyoverStatus.SUCCESS:
              label = TxStatusStep.COMPLETED;
              index = 3;
              break;
            case FlyoverStatus.FAILED:
              label = TxStatusStep.FAILED;
              index = 1;
              break;
            default:
              label = TxStatusStep.EMPTY;
              index = 0;
              break;
          }
        } else { // Native Pegout
          switch (txDetails.value.status as PegoutStatus) {
            case PegoutStatus.PENDING:
              label = TxStatusStep.IN_PROGRESS;
              index = 1;
              break;
            case PegoutStatus.RECEIVED:
              label = TxStatusStep.IN_PROGRESS;
              index = 1;
              break;
            case PegoutStatus.WAITING_FOR_CONFIRMATION:
              label = TxStatusStep.IN_PROGRESS;
              index = 2;
              break;
            case PegoutStatus.WAITING_FOR_SIGNATURE:
              label = TxStatusStep.IN_PROGRESS;
              index = 3;
              break;
            case PegoutStatus.RELEASE_BTC:
              label = TxStatusStep.COMPLETED;
              index = 3;
              break;
            case PegoutStatus.NOT_PEGOUT_TX:
              label = TxStatusStep.FAILED;
              index = 1;
              break;
            case PegoutStatus.NOT_FOUND:
              label = TxStatusStep.FAILED;
              index = 1;
              break;
            case PegoutStatus.REJECTED:
              label = TxStatusStep.FAILED;
              index = 1;
              break;
            default:
              label = TxStatusStep.EMPTY;
              index = 0;
          }
        }
      } else if (props.isFlyover) { // Flyover PegIn
        switch (status.value.flyoverStatus?.status) {
          case FlyoverStatus.PENDING:
            label = TxStatusStep.IN_PROGRESS;
            index = 2;
            break;
          case FlyoverStatus.SUCCESS:
            label = TxStatusStep.COMPLETED;
            index = 3;
            break;
          case FlyoverStatus.FAILED:
            label = TxStatusStep.FAILED;
            index = 1;
            break;
          default:
            label = TxStatusStep.EMPTY;
            index = 0;
            break;
        }
      } else { // Native PegIn
        const txDetailsPegIn = txDetails.value as PeginStatus;
        const btc = txDetailsPegIn.btc as BtcPeginStatus;
        const rsk = txDetailsPegIn.rsk as RskPeginStatus;
        switch (txDetailsPegIn.status as PegStatus) {
          case PegStatus.NOT_IN_BTC_YET:
            label = TxStatusStep.IN_PROGRESS;
            index = 1;
            break;
          case PegStatus.WAITING_CONFIRMATIONS:
            label = TxStatusStep.IN_PROGRESS;
            index = 1;
            if (btc.confirmations >= btc.requiredConfirmation) {
              label = TxStatusStep.IN_PROGRESS;
              index = 2;
            }
            break;
          case PegStatus.NOT_IN_RSK_YET:
            label = TxStatusStep.IN_PROGRESS;
            index = 2;
            break;
          case PegStatus.CONFIRMED:
            label = TxStatusStep.IN_PROGRESS;
            index = 3;
            if (rsk.status === RskStatus.LOCKED) {
              label = TxStatusStep.COMPLETED;
              index = 3;
            }
            break;
          case PegStatus.REJECTED_REFUND:
            label = TxStatusStep.FAILED;
            index = 1;
            break;
          case PegStatus.REJECTED_NO_REFUND:
            label = TxStatusStep.FAILED;
            index = 1;
            break;
          case PegStatus.ERROR_BELOW_MIN:
            label = TxStatusStep.FAILED;
            index = 1;
            break;
          case PegStatus.ERROR_NOT_A_PEGIN:
            label = TxStatusStep.FAILED;
            index = 1;
            break;
          case PegStatus.ERROR_UNEXPECTED:
            label = TxStatusStep.FAILED;
            index = 1;
            break;
          default:
            label = TxStatusStep.EMPTY;
            index = 0;
            break;
        }
      }
      return {
        label,
        index,
      } as { label: TxStatusStep; index: number };
    });
    const imgStep1 = computed(() => {
      if (statusStep.value.index === 1) {
        if (statusStep.value.label === TxStatusStep.FAILED) return require('@/assets/status/ellipse_error.svg');
        if (statusStep.value.label === TxStatusStep.IN_PROGRESS) return require('@/assets/status/ellipse.svg');
      }
      return require('@/assets/status/ellipse_empty.svg');
    });
    const imgStep2 = computed(() => {
      if (statusStep.value.index === 2 && statusStep.value.label === TxStatusStep.IN_PROGRESS) {
        return require('@/assets/status/ellipse.svg');
      }
      return require('@/assets/status/ellipse_empty.svg');
    });
    const imgStep3 = computed(() => {
      if (statusStep.value.index === 3 && statusStep.value.label === TxStatusStep.IN_PROGRESS) {
        return require('@/assets/status/ellipse.svg');
      }
      return require('@/assets/status/ellipse_empty.svg');
    });
    const estimatedTime = computed(() => {
      if (status.value.type === TxStatusType.FLYOVER_PEGIN) {
        const details = status.value.txDetails as FlyoverStatusModel;
        const quote = details.quote as PeginQuoteDTO2WP;
        return blockConfirmationsToTimeString(quote.confirmations);
      }
      if (status.value.type === TxStatusType.FLYOVER_PEGOUT) {
        const details = status.value.txDetails as FlyoverStatusModel;
        const quote = details.quote as PegoutQuoteDTO2WP;
        return blockConfirmationsToTimeString(quote.depositConfirmations);
      }
      if (status.value.type === TxStatusType.PEGOUT) return '34 hours';
      if (status.value.type === TxStatusType.PEGIN) return '17 hours';
      return '';
    });
    const statusSummary = computed(() => {
      if (statusStep.value.label === TxStatusStep.FAILED) {
        return {
          icon: require('@/assets/status/error-icon.svg'),
          time: '',
          label: TxStatusStep.FAILED,
        };
      }
      if (statusStep.value.label === TxStatusStep.COMPLETED) {
        return {
          icon: require('@/assets/status/success-icon.svg'),
          time: estimatedTime.value,
          label: TxStatusStep.COMPLETED,
        };
      }
      return {
        icon: require('@/assets/status/progress-icon.svg'),
        time: estimatedTime.value,
        label: TxStatusStep.IN_PROGRESS,
      };
    });
    const firstLabel = computed(() => {
      if (txFailed.value) {
        return 'Looks like there was a problem';
      }
      if (status.value.type === TxStatusType.PEGIN) {
        const txDetailsPegIn = txDetails.value as PeginStatus;
        const btc = txDetailsPegIn.btc as BtcPeginStatus;
        const confirmations = btc.confirmations < btc.requiredConfirmation
          ? btc.confirmations : btc.requiredConfirmation;
        return `${confirmations} of ${btc.requiredConfirmation} blocks confirmed`;
      }
      return 'Waiting for network confirmations';
    });
    const rejectionMsg = computed(() => {
      const details = txDetails.value as PegoutStatusDataModel;
      const { LOW_AMOUNT, CALLER_CONTRACT, FEE_ABOVE_VALUE } = constants.RejectedPegoutReasons;
      if (props.txNotFound) {
        if (status.value.type === TxStatusType.BLOCKBOOK_FAILED) {
          return 'We are experiencing technical issues and therefore were unable to retrieve and'
            + ' display the transaction status. Please try again later.';
        }
        return 'Transaction not found, verify your transaction ID or try again later';
      }
      switch (details.reason) {
        case LOW_AMOUNT:
          return 'The transaction was rejected because the amount is less than the minimum required.';
        case CALLER_CONTRACT:
          return 'The transaction was rejected because the sender is a contract.';
        case FEE_ABOVE_VALUE:
          return 'Due to high network fees, your transaction is cancelled. Please try again later when network fees are lower or you can bridge higher amounts. Your balance should not be affected.';
        default:
          return '';
      }
    });
    return {
      isPegOut,
      initialStepImage,
      finalStepImage,
      statusStep,
      imgStep1,
      imgStep2,
      imgStep3,
      txFailed,
      sendedAmount,
      receivedAmount,
      sendedAmountTicker,
      receivedAmountTicker,
      sendedAmountUSD,
      receivedAmountUSD,
      type,
      statusSummary,
      TxStatusStep,
      firstLabel,
      errorStepImg: require('@/assets/status/error-step.svg'),
      successStepImg: require('@/assets/status/success-step.svg'),
      exchangeStepImg: require('@/assets/status/exchange-step.svg'),
      finalStepImg: require('@/assets/status/final-step.svg'),
      rejectionMsg,
    };
  },
});
</script>

<style scoped>
  .text-body-1 {
    font-size: 16px;
    line-height: 24px;
    letter-spacing: -1%;
    font-weight: 400;
  }
  .text-body-amount {
    font-size: 28px;
    line-height: 28px;
    letter-spacing: -2.3%;
    font-weight: 700;
    color: rgb(var(--v-theme-white));
  }
  .text-body-ticker {
    font-size: 16px;
    line-height: 20.42px;
    letter-spacing: 0.2%;
    font-weight: 700;
    color: rgb(var(--v-theme-bw-500));
  }
  .text-body-step {
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0%;
    font-weight: 400;
    color: rgb(var(--v-theme-bw-500));
  }
  .text-body-time {
    font-size: 12px;
    line-height: 18px;
    letter-spacing: -1%;
    font-weight: 500;
    color: rgb(var(--v-theme-bw-500));
  }
  .text-body-status {
    font-size: 16px;
    line-height: 18px;
    letter-spacing: -1%;
    font-weight: 700;
  }
  .text-body-reason {
    font-size: 14px;
    line-height: 16.8px;
    letter-spacing: 0%;
    font-weight: 400;
  }
  a {
    color: rgb(var(--v-theme-orange)) !important;
    font-weight: 700 !important;
  }
</style>
