<template>
  <div class="d-flex justify-center exchange-form">
    <v-card width="550" class="container">
      <v-row class="mx-0 my-8 d-flex justify-center">
        <v-icon color="#4CAF50" x-large>mdi-checkbox-marked-circle</v-icon>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <h3 class="text-center">SUCCESS!</h3>
      </v-row>
      <v-row class="mx-0 mb-5 d-flex justify-center">
        <h3 class="text-center">Your {{environmentContext.getBtcText()}}s were sent</h3>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <p class="text-center ma-0">You can close the tab freely, we will notify you.</p>
      </v-row>
      <v-row class="mx-0 mb-8 d-flex justify-center">
        <p class="text-center ma-0">Remember it will take between 16-17 hours.</p>
      </v-row>
      <v-row class="mx-0 mb-3 d-flex justify-center dialog">
        <v-btn class="button" color="#126DF2" @click="$emit('track')">
          <span class="whiteish">Continue</span>
        </v-btn>
      </v-row>
    </v-card>
  </div>
</template>

<script lang="ts">
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default {
  name: 'SuccessSend',
  setup() {
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    return {
      environmentContext,
    };
  }
}
</script>
