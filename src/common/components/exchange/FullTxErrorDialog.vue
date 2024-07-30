<template>
    <v-dialog v-model="show" width="470" persistent>
      <v-card class="container dialog">
        <v-row class="mx-0 mt-6 d-flex justify-center">
          <v-img :src="require('@/assets/warning.svg')" height="47" contain />
        </v-row>
        <v-row class="mx-0 mt-6 mb-3 d-flex justify-center">
          <h2 class="bg-purple px-4">Error on Transaction</h2>
        </v-row>
        <v-row>
            <v-col offset="2" cols="8">
                <p class="justify-center">{{ error.userMessage }}</p>
            </v-col>
        </v-row>
        <v-row v-if="showDevError">
            <v-col offset="2">
                <p class="justify-center">{{ error.technicalMessage }}</p>
            </v-col>
        </v-row>
        <v-row v-if="showDevError">
            <v-col offset="2">
                <p class="justify-center">
                    Service: {{ error.serviceName }} - Method: {{ error.triggeredByMethod }}
                </p>
            </v-col>
        </v-row>
        <v-row class="ma-0 my-8" justify="space-around">
            <v-btn-rsk @click="toExchange">
              <span>Return to home</span>
            </v-btn-rsk>
            <v-btn-rsk  @click="closeErrorDialog">
              <span>Close</span>
            </v-btn-rsk>
        </v-row>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import ServiceError from '@/common/utils/ServiceError';
import { ref, defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'FullTxErrorDialog',
  props: {
    showTxErrorDialog: Boolean,
    error: {
      type: Object as PropType<ServiceError>,
      required: true,
    },
  },
  setup(props, context) {
    const show = ref(props.showTxErrorDialog);
    const router = useRouter();

    const showDevError = EnvironmentAccessorService.getEnvironmentVariables().debugMode;

    function toExchange() {
      router.push({ name: 'Home' });
    }

    function closeErrorDialog() {
      context.emit('closeErrorDialog', props.showTxErrorDialog);
    }

    return {
      show,
      toExchange,
      closeErrorDialog,
      showDevError,
    };
  },
});
</script>
