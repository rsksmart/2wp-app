<template>
  <v-dialog v-model="showDialog" width="600" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-4 d-flex justify-end">
        <v-btn height="50" color="#FFFFFF" @click="closeDialog">
          <v-icon large color="grey darken-2">
            mdi-close-circle-outline
          </v-icon>
        </v-btn>
      </v-row>
      <v-row class="mx-0 mt-5 mb-3 d-flex justify-center">
        <h2>{{ from }} TO {{ to }} CONVERSION REQUIRES THESE STEPS</h2>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <v-col cols="10">
          <p> Please take into consideration that the {{ from }} to {{ to }}
          conversion process requires {{ blockConfirmations }} {{ from }}
          block confirmations.
          It is estimated to take around {{ hours }} hours (can vary
          depending on conditions of the {{ network }} network). </p>
        </v-col>
      </v-row>
      <v-row class="mx-0 mb-3 mt-1">
        <v-img
        :src="require(`@/assets/exchange/trezor/${from.toLowerCase()}_conversion.png`)"
        height="135" contain
        />
      </v-row>
      <v-row class="mx-0 mt-8 mb-4 d-flex justify-center">
        <v-checkbox
          v-model="checkbox"
          :label="`Don't show again`">
          </v-checkbox>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component, Prop, Emit,
  Vue,
} from 'vue-property-decorator';
import EnvironmentContextProviderService from '@/providers/EnvironmentContextProvider';

@Component
export default class DisclaimerDialog extends Vue {
  @Prop() showDialog!: boolean;

  @Prop() from!: string;

  @Prop() to!: string;

  @Prop() cookie!: string;

  @Prop() hours!: number;

  @Prop() blockConfirmations!: number;

  @Prop() network!: string;

  checkbox = false;

  environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

  @Emit('closeDialog')
  closeDialog() {
    if (this.checkbox === true) {
      localStorage.setItem(this.cookie, 'true');
    }
    return this.showDialog;
  }
}
</script>
