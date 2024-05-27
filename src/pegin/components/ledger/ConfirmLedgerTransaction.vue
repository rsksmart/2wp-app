<template>
  <v-container>
    <v-row>
      <p>Confirm Transaction on your Ledger Wallet</p>
    </v-row>
    <v-row>
      <v-col cols="3" class="pl-0">
        <v-card variant="outlined" color="bw-400">
          <v-container>
            <v-row justify="start" class="mt-2">
              <v-img :src="require('@/assets/exchange/steps/0.svg')"
                     position="left top" height="180" contain/>
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
              <p class="text-h6 text-off-white">
                See on
              </p>
            </v-row>
            <v-row no-gutters class="mb-5">
              <p class="text-h6 text-off-white">
                Ledger
              </p>
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
                            model-value="Amount: 0 RBTC" />
            </v-row>
            <v-row no-gutters>
              <v-textarea hide-details auto-grow readonly
                          class="text-bw-400"
                          variant="outlined" density="compact" rows="1"
                          :model-value="opReturnData" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="mt-2 white"
                            bg-color="rgba(243, 139, 1, 0.4)" base-color="orange"
                            variant="outlined"
                            density="compact"
                            model-value="Press Confirm on Ledger">
                <template v-slot:prepend-inner>
                  <v-icon color="white">
                    {{ mdiInformation }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card variant="outlined" color="bw-400">
          <v-container>
            <v-row justify="start" class="mt-2">
              <v-img :src="require('@/assets/exchange/steps/1.svg')"
                     position="left top" height="180" contain/>
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
              <p class="text-h6 text-off-white">
                See on
              </p>
            </v-row>
            <v-row no-gutters class="mb-5">
              <p class="text-h6 text-off-white">
                Ledger
              </p>
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details
                            class="text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="rskFederationAddress" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="my-2 text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="amountTransferString" />
            </v-row>
            <v-row no-gutters>
              <v-textarea hide-details no-resize auto-grow readonly
                          class="text-bw-400"
                          variant="outlined" density="compact" rows="1"
                          model-value="" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="mt-2 white"
                            bg-color="rgba(9, 243, 198, 0.4)" base-color="teal"
                            variant="outlined"
                            density="compact"
                            model-value="Press Confirm on Ledger">
                <template v-slot:prepend-inner>
                  <v-icon color="white">
                    {{ mdiInformation }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card variant="outlined" color="bw-400">
          <v-container>
            <v-row justify="start" class="mt-2">
              <v-img :src="require('@/assets/exchange/steps/2.svg')"
                     position="left top" height="180" contain/>
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
              <p class="text-h6 text-off-white">
                See on
              </p>
            </v-row>
            <v-row no-gutters class="mb-5">
              <p class="text-h6 text-off-white">
                Ledger
              </p>
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details
                            class="text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="changeAddress" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="my-2 text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="changeAmountString" />
            </v-row>
            <v-row no-gutters>
              <v-textarea hide-details no-resize auto-grow readonly
                          class="text-bw-400"
                          variant="outlined" density="compact" rows="1"
                          model-value="" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="mt-2 white"
                            bg-color="rgba(116, 189, 1, 0.4)" base-color="green"
                            variant="outlined"
                            density="compact"
                            model-value="Press Confirm on Ledger">
                <template v-slot:prepend-inner>
                  <v-icon color="white">
                    {{ mdiInformation }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="3">
        <v-card variant="outlined" color="bw-400">
          <v-container>
            <v-row justify="start" class="mt-2">
              <v-img :src="require('@/assets/exchange/steps/3.svg')"
                     position="left top" height="180" contain/>
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
              <p class="text-h6 text-off-white">
                See on
              </p>
            </v-row>
            <v-row no-gutters class="mb-5">
              <p class="text-h6 text-off-white">
                Ledger
              </p>
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details
                            class="text-bw-400"
                            variant="outlined"
                            density="compact"
                            model-value="" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="my-2 text-bw-400"
                            variant="outlined"
                            density="compact"
                            :model-value="feeString" />
            </v-row>
            <v-row no-gutters>
              <v-textarea hide-details no-resize auto-grow readonly
                          class="text-bw-400"
                          variant="outlined" density="compact" rows="1"
                          model-value="" />
            </v-row>
            <v-row no-gutters>
              <v-text-field readonly hide-details class="mt-2 white"
                            bg-color="rgba(243, 108, 215, 0.4)" base-color="pink"
                            variant="outlined"
                            density="compact"
                            model-value="Press Confirm on Ledger">
                <template v-slot:prepend-inner>
                  <v-icon color="white">
                    {{ mdiInformation }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import SatoshiBig from '@/common/types/SatoshiBig';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { PegInTxState } from '@/common/types/pegInTx';
import * as constants from '@/common/store/constants';
import { useGetter, useState } from '@/common/store/helper';
import { mdiInformation } from '@mdi/js';

export default defineComponent({
  name: 'ConfirmLedgerTransaction',
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const pegInTxState = useState<PegInTxState>('pegInTx');
    const safeFee = useGetter<SatoshiBig>('pegInTx', constants.PEGIN_TX_GET_SAFE_TX_FEE);
    const rskFederationAddress = computed(():string => pegInTxState.value
      .normalizedTx.outputs[1]?.address?.trim()
      ?? `${environmentContext.getBtcText()} Powpeg address not found`);

    const opReturnData = computed((): string => {
      const [opReturnOutput] = pegInTxState.value.normalizedTx.outputs;
      return opReturnOutput?.op_return_data ?? '';
    });

    const changeAddress = computed((): string => {
      const [, , change] = pegInTxState.value.normalizedTx.outputs;
      if (change && change.address) {
        return change.address;
      }
      return 'Change address not found';
    });

    const changeAmountString = computed(() => {
      const changeAmountInSB = new SatoshiBig(pegInTxState.value.normalizedTx.outputs[2]?.amount ?? 0, 'satoshi');
      return `Amount: ${changeAmountInSB.toBTCTrimmedString()} ${environmentContext.getBtcTicker()}`;
    });

    const amountTransferString = computed(() => `Amount: ${pegInTxState
      .value.amountToTransfer.toBTCTrimmedString()}  ${environmentContext.getBtcTicker()}`);

    const feeString = computed(() => `Fee: ${safeFee
      .value.toBTCTrimmedString()}  ${environmentContext.getBtcTicker()}`);

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
    };
  },
});
</script>
