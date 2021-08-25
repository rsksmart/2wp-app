<template>
  <v-dialog v-model="showDialog" width="470" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-3 mb-3 d-flex justify-center">
        <h2>LEDGER WARNING</h2>
      </v-row>
      <v-col cols="12" align-self="center" class="pt-0">
        <v-col offset="1" cols="10">
          <p class="justify-center">
            Don't worry, this warning won't affect the process.
            You can continue signing the transaction.
          </p>
        </v-col>
        <v-row class="mx-0 mt-4 d-flex justify-center">
          <v-img :src="iconPath" height="230" contain />
        </v-row>
        <v-row class="mx-0 mb-8 mt-6" justify="space-around">
          <v-btn width="100" height="40" dense outlined rounded color="#00B520" @click="close">
            <span class="greenish">Got it</span>
          </v-btn>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component, Prop, Emit, Vue,
} from 'vue-property-decorator';
import UnverifiedInputsImage from '@/assets/exchange/ledger/unverified_inputs_ledger.png';

@Component
export default class UnverifiedInputsDialog extends Vue {
  @Prop() showDialog!: boolean;

  @Prop() errorMessage!: string;

  iconPath = UnverifiedInputsImage;

  @Emit()
  close() {
    this.showDialog = false;
  }

  @Emit('closeErrorDialog')
  closeErrorDialog() {
    return this.showDialog;
  }
}
</script>
