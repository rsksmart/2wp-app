<template>
  <v-dialog v-model="show" width="600" persistent>
    <v-card class="container dialog px-4 align-center">
      <v-row class="mx-0 mt-4 d-flex align-self-end">
        <v-btn height="50" @click="closeDialog" variant="text">
          <v-icon size="36" :icon="mdiCloseCircleOutline" color="#616161">
          </v-icon>
        </v-btn>
      </v-row>
      <v-row class="mx-0 mt-5 mb-3 d-flex justify-center">
        <h2>{{environmentContext.getBtcTicker()}} TO
        {{environmentContext.getRbtcTicker()}} CONVERSION REQUIRES THESE STEPS</h2>
      </v-row>
      <v-row class="mx-0 d-flex justify-center">
        <v-col cols="10">
          <p>Please take into consideration that the {{environmentContext.getBtcTicker()}} to
          {{environmentContext.getRbtcTicker()}} conversion process requires 100
            {{environmentContext.getBtcText()}} block confirmations.
            It is estimated to take around 17 hours (can vary
            depending on conditions of the {{environmentContext.getBtcText()}} network).</p>
        </v-col>
      </v-row>
      <v-row class="mx-0 mb-3 mt-3">
        <v-img
        :src="imgSrc"
        height="135" min-width="500"
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
import { ref, defineComponent, computed } from 'vue';
import { mdiCloseCircleOutline } from '@mdi/js';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default defineComponent({
  name: 'BtcToRbtcDialog',
  props: {
    showDialog: Boolean,
  },
  setup(props, context) {
    const show = ref(props.showDialog);
    const checkbox = ref(false);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    const imgSrc = computed(() => {
      const ticker = environmentContext.getBtcTicker().toLowerCase();
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`@/assets/exchange/trezor/${ticker}_conversion.png`);
    });

    function closeDialog() {
      if (checkbox.value === true) {
        localStorage.setItem('BTRD_COOKIE_DISABLED', 'true');
      }
      return context.emit('closeDialog', props.showDialog);
    }

    return {
      checkbox,
      environmentContext,
      closeDialog,
      show,
      mdiCloseCircleOutline,
      imgSrc,
    };
  },
});
</script>
