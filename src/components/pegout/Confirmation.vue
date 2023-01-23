<template>
  <div class="transactions">
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="10" lg="8" xl="6" class="d-flex justify-center">
        <h1 class="text-center">
            Congratulations Your RBTC were tranfered
        </h1>
      </v-col>
    </v-row>
     <v-row class="mx-0 my-8 d-flex justify-center">
      <p class="text-center">
        You can follow the status of conversion from the status page.
      </p>
    </v-row>
    <v-row class="mx-0 my-8">
      <tx-summary
        :showTxId="false"
        :initialExpand="true"
        :type='typeSummary'
        :orientation='orientationSummary'/>
    </v-row>
    <v-row v-if="confirmTxState.matches(['idle', 'error', 'goingHome'])" class="ma-0">
      <v-col cols="2" class="d-flex justify-start ma-0 py-0">
        <v-btn rounded outlined color="#00B520" width="110"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span>Back</span>
        </v-btn>
      </v-col>
      <v-col cols="10" class="d-flex justify-end ma-0 py-0">
        <v-btn rounded color="#00B520" width="110"
               :disabled="confirmTxState.matches(['error', 'goingHome', 'loading'])">
          <span class="whiteish">Send</span>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop,
  Vue,
} from 'vue-property-decorator';
import TxSummary from '@/components/exchange/TxSummary.vue';
import { Machine } from '@/services/utils';
import { TxStatusType } from '@/types/store';
import { TxSummaryOrientation } from '@/types/Status';

@Component({
  components: {
    TxSummary,
  },
})

export default class Confirmation extends Vue {
  typeSummary = TxStatusType.PEGIN;

  orientationSummary = TxSummaryOrientation.HORIZONTAL;

  @Prop() confirmTxState!: Machine<
    'idle'
    | 'loading'
    | 'error'
    | 'goingHome'
    >;

  VALUE_INCOMPLETE_MESSAGE = 'Not Found';
}
</script>
