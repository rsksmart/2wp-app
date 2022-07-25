<template>
  <v-col>
      <v-row justify="center" class="mt-6">
<<<<<<< HEAD
        <div v-if="pegStatus">Pegout status: {{pegStatus.status}}</div>
=======
        <div v-if="pegStatus">Pegout status: {{pegStatus?.status}}</div>
>>>>>>> error component
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
  PegoutStatusDataModel,
} from '@/types';

@Component({})
export default class TxPegout extends Vue {
  @Prop() pegStatus!: PegoutStatusDataModel;
<<<<<<< HEAD
=======

  created() {
    console.log('>>>>>', this.pegStatus);
  }
>>>>>>> error component
}
</script>
