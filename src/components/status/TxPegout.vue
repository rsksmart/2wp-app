<template>
  <v-col>
      <v-row justify="center" class="mt-6">
        <pegout-progress/>
      </v-row>
  </v-col>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
} from 'vue-property-decorator';
import {
  TxStatus,
} from '@/types';
import { State, Getter } from 'vuex-class';
import * as constants from '@/store/constants';
import PegoutProgress from '@/components/status/PegoutProgress.vue';

@Component({
  components: {
    PegoutProgress,
  },
})
export default class TxPegout extends Vue {
  @Prop() txId!: string;

  @State('status') txStatus!: TxStatus;

  @Getter(constants.STATUS_IS_REJECTED, { namespace: 'status' }) isRejected!: boolean;
}
</script>
