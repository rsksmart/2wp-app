<template>
    <v-dialog v-model="showWarningMessage" width="470" persistent>
      <v-card>
        <v-container>
          <v-row class="d-flex justify-center my-4">
            <h2 class="bg-purple px-2">Review conditions</h2>
          </v-row>
          <v-row class="d-flex justify-center">
            <v-col>
              <p class="text-center my-2">
                Network conditions have changed by
                <span class="text-purple font-weight-bold">
                  {{ quoteDifference.percentage.toFixed(2) }}%
                </span>.
              </p>
              <p class="text-center">
                Fees have {{ increasedOrDecreasedString }} from
                <span class="text-purple">
                  {{ previousQuoteFees.toRBTCTrimmedString() }}
                </span> to
              </p>
              <p class="text-center">
                <span class="text-purple">
                  {{ currentQuoteFees.toRBTCTrimmedString() }}
                </span>
                {{ environmentContext.getRbtcTicker() }}.
              </p>
              <p class="text-center text-body-2 my-4">
                Please note that these values are estimates based on the network.
              </p>
            </v-col>
          </v-row>
          <v-row no-gutters class="ma-4">
            <v-col class="d-flex justify-start py-0">
              <v-btn-rsk
                @click="cancel">
                Cancel
              </v-btn-rsk>
            </v-col>
            <v-col class="d-flex justify-end py-0">
              <v-btn-rsk @click="send">
                <span>Ok, proceed anyway</span>
              </v-btn-rsk>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue';
import { mdiAlertOutline } from '@mdi/js';
import { useStateAttribute } from '@/common/store/helper';
import { ObjectDifference, ReducedQuote } from '@/common/types';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default defineComponent({
  name: 'QuoteDiffDialog',
  props: {
    showDialog: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showWarningMessage = toRef(props, 'showDialog');
    const quoteDifference = useStateAttribute<ObjectDifference>('flyoverPegout', 'difference');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const getTotalFees = (quoteDiff: ReducedQuote) => (quoteDiff.gasFee
      .plus(quoteDiff.callFee)
      .plus(quoteDiff.productFeeAmount));

    const previousQuoteFees = computed(() => (getTotalFees(quoteDifference.value
      .previousQuote)));
    const currentQuoteFees = computed(() => (getTotalFees(quoteDifference.value
      .currentQuote)));
    const increasedOrDecreasedString = computed(() => (previousQuoteFees.value
      .lt(currentQuoteFees.value) ? 'increased' : 'decreased'));

    const send = () => {
      showWarningMessage.value = false;
      emit('continue');
    };

    const cancel = () => {
      showWarningMessage.value = false;
      emit('cancel');
    };

    return {
      send,
      cancel,
      showWarningMessage,
      mdiAlertOutline,
      quoteDifference,
      previousQuoteFees,
      currentQuoteFees,
      increasedOrDecreasedString,
      environmentContext,
    };
  },
});
</script>
