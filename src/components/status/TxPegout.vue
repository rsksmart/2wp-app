<template>
  <v-col>
      <v-row justify="center" class="mt-6">
        <div v-if="pegStatus">Pegout status: {{pegStatus.status}}</div>
      </v-row>
  </v-col>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
  Emit,
} from 'vue-property-decorator';
import { setStatusMessage } from '@/services/utils';
import {
  PegoutStatusDataModel,
  TxStatusType,
} from '@/types';

@Component
export default class TxPegout extends Vue {
  @Prop() pegStatus!: PegoutStatusDataModel;

  @Emit('setMessage')
  setMessage() {
    return setStatusMessage(TxStatusType.PEGOUT, this.pegStatus.status);
  }

  created() {
    this.setMessage();
  }
}
</script>
