<template>
  <v-container class="confirmation-step">
    <v-row>
      <p class="text-h6">Confirm Transaction on your {{ walletName }} Wallet</p>
    </v-row>
    <v-row class="mt-6 text-bw-400">
      Make sure the amount, address and transaction fee displayed on the {{ walletName }} wallet
      are correct.
    </v-row>
    <v-row class="text-bw-400">
      To prevent malware attacks, double check the address with the recipient.
    </v-row>
    <v-row v-if="hdWallet" class="d-flex justify-center ma-0 mt-3">
      <v-col cols="3" class="px-1" v-if="!flyover">
        <v-card variant="outlined" color="bw-400" height="100%">
          <v-container>
            <v-row justify="start" class="mt-2 mb-6 px-3">
              <v-img :src="require('@/assets/exchange/steps/0.svg')"
                     position="left top" height="136" contain/>
            </v-row>
            <v-row no-gutters>
              <p class="text-h5 bg-orange pa-1 mb-1">
                Your
              </p>
            </v-row>
            <v-row no-gutters class="mb-16">
              <p class="text-h5 bg-orange pa-1">
                Transaction
              </p>
            </v-row>
            <v-row no-gutters>
              <span class="text-h4">
                See on
              </span>
            </v-row>
            <v-row no-gutters class="mb-5">
              <span class="text-h4">
                {{ walletName }}
              </span>
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details
                            class="text-bw-400"
                            variant="outlined"
                            density="compact"
                            model-value="OP_RETURN" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="my-2 text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="amountTransferOpReturn" />
            </v-row>
            <v-row no-gutters>
              <v-textarea hide-details readonly no-resize
                          class="text-bw-400"
                          variant="outlined" density="compact" rows="2"
                          :model-value="opReturnData" />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="3" class="px-1">
        <v-card variant="outlined" color="bw-400" height="100%">
          <v-container>
            <v-row justify="start" class="mt-2 mb-6 px-3">
              <v-img :src="require('@/assets/exchange/steps/1.svg')"
                     position="left top" height="136" contain/>
            </v-row>
            <v-row no-gutters>
              <p class="text-h5 bg-teal pa-1 mb-1">
                Funds
              </p>
            </v-row>
            <v-row no-gutters class="mb-16">
              <p class="text-h5 bg-teal pa-1">
                Transfer
              </p>
            </v-row>
            <v-row no-gutters>
              <span class="text-h4">
                See on
              </span>
            </v-row>
            <v-row no-gutters class="mb-5">
              <span class="text-h4">
                {{ walletName }}
              </span>
            </v-row>
            <v-row no-gutters>
              <v-textarea hide-details auto-grow readonly
                          class="text-bw-400"
                          variant="outlined" density="compact" rows="1"
                          :model-value="providerRecipientAddress"
                          >
                <template v-slot:append-inner>
                  <v-col>
                    <v-row>
                      <v-btn height="32" width="32"
                        variant="plain"
                        @click="copyToClipboard(providerRecipientAddress)" density="compact"
                        :icon="mdiContentCopy">
                      </v-btn>
                    </v-row>
                    <v-row>
                      <v-btn height="32" width="32" variant="plain"
                          @click="openAddressInExplorer(providerRecipientAddress)"
                          density="compact" :icon="mdiOpenInNew" >
                    </v-btn>
                    </v-row>
                  </v-col>
                </template>
              </v-textarea>
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="my-2 text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="amountTransferString" />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="3" class="px-1" v-if="hasChange">
        <v-card variant="outlined" color="bw-400" height="100%">
          <v-container>
            <v-row justify="start" class="mt-2 mb-6 px-3">
              <v-img :src="require('@/assets/exchange/steps/2.svg')"
                     position="left top" height="136" contain/>
            </v-row>
            <v-row no-gutters>
              <p class="text-h5 bg-green pa-1 mb-1">
                Change
              </p>
            </v-row>
            <v-row no-gutters class="mb-16">
              <p class="text-h5 bg-green pa-1">
                Address
              </p>
            </v-row>
            <v-row no-gutters>
              <span class="text-h4">
                See on
              </span>
            </v-row>
            <v-row no-gutters class="mb-5">
              <span class="text-h4">
                {{ walletName }}
              </span>
            </v-row>
            <v-row no-gutters>
              <v-textarea hide-details auto-grow readonly
                          class="text-bw-400"
                          variant="outlined" density="compact" rows="1"
                          :model-value="changeAddress"
                          >
                <template v-slot:append-inner>
                  <v-col>
                    <v-row>
                      <v-btn height="32" width="32"
                        variant="plain"
                        @click="copyToClipboard(changeAddress)" density="compact"
                        :icon="mdiContentCopy">
                      </v-btn>
                    </v-row>
                    <v-row>
                      <v-btn height="32" width="32" variant="plain"
                          @click="openAddressInExplorer(changeAddress)"
                          density="compact" :icon="mdiOpenInNew" >
                    </v-btn>
                    </v-row>
                  </v-col>
                </template>
              </v-textarea>
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="my-2 text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="changeAmountString" />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="3" class="px-1">
        <v-card variant="outlined" color="bw-400" height="100%">
          <v-container>
            <v-row justify="start" class="mt-2 mb-6 px-3">
              <v-img :src="require('@/assets/exchange/steps/3.svg')"
                     position="left top" height="136" contain/>
            </v-row>
            <v-row no-gutters>
              <p class="text-h5 bg-pink pa-1 mb-1">
                Transaction
              </p>
            </v-row>
            <v-row no-gutters class="mb-16">
              <p class="text-h5 bg-pink pa-1">
                Fee
              </p>
            </v-row>
            <v-row no-gutters>
              <span class="text-h4">
                See on
              </span>
            </v-row>
            <v-row no-gutters class="mb-5">
              <span class="text-h4">
                {{ walletName }}
              </span>
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="feeString" />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else class="d-flex">
      <v-col cols="6" class="pl-0">
        <v-card variant="outlined" color="bw-400">
          <v-container>
            <v-row justify="start" class="mt-2 mb-8">
              <v-col cols="4">
                <v-img :src="require('@/assets/exchange/steps/0.svg')"
                position="left top" height="136" contain/>
              </v-col>
              <v-col class="d-flex">
                <div class="flex-column align-self-end">
                  <v-row no-gutters>
                    <p class="text-h5 bg-orange pa-1 mb-1">
                      Transaction
                    </p>
                  </v-row>
                  <v-row no-gutters>
                    <p class="text-h5 bg-orange pa-1">
                      Outputs
                    </p>
                  </v-row>
                </div>
              </v-col>
            </v-row>

            <v-row no-gutters>
              <span class="text-h4">
                See on {{ walletName }}
              </span>
            </v-row>
            <v-col class="pl-4">
              <div v-if="!flyover">
                <v-row no-gutters class="mb-2">
                <span>
                  OP Return
                </span>
              </v-row>
              <v-row no-gutters>
                <v-text-field readonly hide-details
                              class="text-bw-400 mb-2"
                              variant="outlined"
                              density="compact"
                              model-value="Amount: 0" />
              </v-row>
              <v-row no-gutters>
                <v-textarea hide-details auto-grow readonly
                            class="text-bw-400"
                            variant="outlined" density="compact" rows="1"
                            :model-value="opReturnData" />
              </v-row>
              </div>
              <v-row no-gutters class="mb-2">
                <span>
                  {{ flyover ? 'Provider' : 'Federation' }}
                </span>
              </v-row>
              <v-row no-gutters>
                <v-text-field readonly hide-details
                              class="text-bw-400 mb-2"
                              variant="outlined"
                              density="compact"
                              :model-value="amountTransferString" />
              </v-row>
              <v-row no-gutters>
                <v-textarea hide-details auto-grow readonly
                            class="text-bw-400"
                            variant="outlined" density="compact" rows="1"
                            :model-value="rskFederationAddress" />
              </v-row>
              <div v-if="existChange" >
                <v-row no-gutters class="mb-2 mt-4">
                  <span>
                    Change
                  </span>
                </v-row>
                <v-row no-gutters>
                  <v-text-field readonly hide-details
                                class="text-bw-400 mb-2"
                                variant="outlined"
                                density="compact"
                                :model-value="changeAmountString" />
                </v-row>
                <v-row no-gutters>
                  <v-textarea hide-details auto-grow readonly
                              class="text-bw-400"
                              variant="outlined" density="compact" rows="1"
                              :model-value="changeAddress" />
                </v-row>
              </div>
            </v-col>
          </v-container>
        </v-card>
        </v-col>
        <v-col cols="6" class="pr-0">
          <v-card variant="outlined" color="bw-400" height="100%">
            <v-container>
              <v-row justify="start" class="mt-2 mb-8">
                <v-col cols="4">
                  <v-img :src="require('@/assets/exchange/steps/3.svg')"
                  position="left top" height="136" contain/>
                </v-col>
                <v-col class="d-flex">
                  <div class="flex-column align-self-end">
                    <v-row no-gutters>
                      <p class="text-h5 bg-pink pa-1 mb-1">
                        Transaction
                      </p>
                    </v-row>
                    <v-row no-gutters>
                      <p class="text-h5 bg-pink pa-1">
                        Fee
                      </p>
                    </v-row>
                  </div>
                </v-col>
              </v-row>
              <v-row no-gutters>
                <span class="text-h4">
                  See on {{ walletName }}
                </span>
              </v-row>
              <v-col class="pl-4">
                <v-row no-gutters class="mb-2">
                  <span>
                    Chain Fee
                  </span>
                </v-row>
                <v-row no-gutters>
                  <v-text-field readonly hide-details
                                class="text-bw-400 mb-2"
                                variant="outlined"
                                density="compact"
                                :model-value="feeString" />
                </v-row>
                <v-row no-gutters class="mb-2 mt-4">
                  <span>
                    Total
                  </span>
                </v-row>
                <v-row no-gutters>
                  <v-text-field readonly hide-details
                                class="text-bw-400 mb-2"
                                variant="outlined"
                                density="compact"
                                :model-value="amountPlusFeeString" />
                </v-row>
              </v-col>
            </v-container>
          </v-card>
        </v-col>
      <v-row no-gutters>
        <v-text-field readonly hide-details class="mt-2 white"
                      bg-color="rgba(116, 189, 1, 0.4)" base-color="green"
                      variant="outlined"
                      density="compact"
                      :model-value="`Confirm on ${walletName}`">
          <template v-slot:prepend-inner>
            <v-icon color="white">
              {{ mdiInformation }}
            </v-icon>
          </template>

        </v-text-field>
      </v-row>
    </v-row>
    <v-row v-if="hdWallet" no-gutters class="d-flex justify-center px-1">
      <v-col :cols="flyover ? 9 : 12">
        <v-text-field readonly hide-details class="mt-2 white"
                    bg-color="rgba(116, 189, 1, 0.4)" base-color="green"
                    variant="outlined"
                    density="compact"
                    :model-value="`Confirm on ${walletName}`">
        <template v-slot:prepend-inner>
          <v-icon color="white">
            {{ mdiInformation }}
          </v-icon>
        </template>
      </v-text-field>
      </v-col>
    </v-row>
    <v-row justify="end">
      <slot />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import SatoshiBig from '@/common/types/SatoshiBig';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/common/types/pegInTx';
import { PeginQuote } from '@/common/types';
import * as constants from '@/common/store/constants';
import { truncateStringToSize, copyToClipboard, getBtcAddressExplorerUrl } from '@/common/utils';
import { useGetter, useState } from '@/common/store/helper';
import { mdiInformation, mdiOpenInNew, mdiContentCopy } from '@mdi/js';

export default defineComponent({
  name: 'ConfirmationSteps',
  props: {
    hdWallet: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const walletName = useGetter<string>('pegInTx', constants.WALLET_NAME);
    const selectedQuote = useGetter<PeginQuote>('flyoverPegin', constants.FLYOVER_PEGIN_GET_SELECTED_QUOTE);
    const flyover = computed(() => pegInTxState.value.peginType === constants.peginType.FLYOVER);
    const changeIdx = flyover.value ? 1 : 2;

    const amountToTransfer = computed(() => (flyover.value
      ? selectedQuote.value.valueToTransfer
      : pegInTxState.value.amountToTransfer));

    const rskFederationAddress = computed(():string => pegInTxState.value
      .normalizedTx.outputs[1]?.address?.trim()
      ?? `${environmentContext.getBtcText()} Powpeg address not found`);

    const providerRecipientAddress = computed(() => {
      if (flyover.value) {
        const [providerOutput] = pegInTxState.value.normalizedTx.outputs;
        return providerOutput?.address ?? '';
      }
      return rskFederationAddress.value;
    });
    const opReturnData = computed((): string => {
      const [opReturnOutput] = pegInTxState.value.normalizedTx.outputs;
      const zeroX = walletName.value === constants.WALLET_NAMES.LEDGER.formal_name ? '0x' : '';
      return `${zeroX}${truncateStringToSize(opReturnOutput?.op_return_data ?? '', 40)}`;
    });

    const changeAddress = computed((): string => {
      const change = pegInTxState.value.normalizedTx.outputs[changeIdx];
      if (change && change.address) {
        return change.address;
      }
      return 'Change address not found';
    });

    const changeAmountString = computed(() => {
      const changeAmountInSB = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[changeIdx]?.amount ?? 0, 'satoshi');
      return `Amount: ${changeAmountInSB.toBTCTrimmedString()} ${environmentContext.getBtcTicker()}`;
    });

    const amountTransferString = computed(() => `Amount: ${amountToTransfer.value.toBTCTrimmedString()}  ${environmentContext.getBtcTicker()}`);

    const amountPlusFeeString = computed(() => `Amount: ${amountToTransfer.value.plus(safeFee.value).toBTCTrimmedString()}  ${environmentContext.getBtcTicker()}`);

    const amountTransferOpReturn = computed(() => `Amount: 0 ${environmentContext.getBtcTicker()}`);

    const feeString = computed(() => `Fee: ${safeFee
      .value.toBTCTrimmedString()}  ${environmentContext.getBtcTicker()}`);

    const existChange = computed(() => {
      const change = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[changeIdx]?.amount ?? 0, 'satoshi');
      return change.gt(0);
    });

    const hasChange = computed(() => pegInTxState.value.normalizedTx.outputs.length > changeIdx);

    function openAddressInExplorer(address: string) {
      const url = getBtcAddressExplorerUrl(address);
      window.open(url, '_blank');
    }

    return {
      environmentContext,
      changeAmountString,
      pegInTxState,
      rskFederationAddress,
      changeAddress,
      safeFee,
      mdiInformation,
      opReturnData,
      amountTransferString,
      feeString,
      walletName,
      amountPlusFeeString,
      existChange,
      flyover,
      amountTransferOpReturn,
      providerRecipientAddress,
      constants,
      mdiContentCopy,
      mdiOpenInNew,
      copyToClipboard,
      getBtcAddressExplorerUrl,
      hasChange,
      openAddressInExplorer,
    };
  },
});
</script>
