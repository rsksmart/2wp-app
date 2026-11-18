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
                  {{ percentage.toFixed(2) }}%
                </span>.
              </p>
              <p class="text-center">
                Fees have {{ increasedOrDecreasedString }} from
                <span class="text-purple">
                  {{ approvedQuoteFees.toRBTCTrimmedString() }}
                </span> to
              </p>
              <p class="text-center">
                <span class="text-purple">
                  {{ finalQuoteFees.toRBTCTrimmedString() }}
                </span>
                {{ environmentContext.getRbtcTicker() }}.
              </p>
              <p class="text-center my-2">
                Your wallet will ask you to send
                <span class="text-purple font-weight-bold">
                  {{ finalQuoteTotal.toRBTCTrimmedString() }}
                </span>
                {{ environmentContext.getRbtcTicker() }} in total.
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
import { QuoteFeeDifference } from '@/common/types';
import { computeFeeDifferencePercentage, sumCallAndGasFees } from '@/common/utils';
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
    const quoteDifference = useStateAttribute<QuoteFeeDifference>('flyoverPegout', 'difference');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const approvedQuoteFees = computed(() => sumCallAndGasFees(quoteDifference.value
      .approvedQuote));
    const finalQuoteFees = computed(() => sumCallAndGasFees(quoteDifference.value.finalQuote));
    const percentage = computed(() => computeFeeDifferencePercentage(
      quoteDifference.value.approvedQuote,
      quoteDifference.value.finalQuote,
    ));
    const finalQuoteTotal = computed(() => (quoteDifference.value.finalQuote.value
      .plus(finalQuoteFees.value)));
    const increasedOrDecreasedString = computed(() => (approvedQuoteFees.value
      .lt(finalQuoteFees.value) ? 'increased' : 'decreased'));

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
      percentage,
      approvedQuoteFees,
      finalQuoteFees,
      finalQuoteTotal,
      increasedOrDecreasedString,
      environmentContext,
    };
  },
});
</script>
