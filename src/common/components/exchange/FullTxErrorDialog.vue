<template>
    <v-dialog v-model="show" width="470" persistent>
      <v-card class="container dialog">
        <v-row class="mx-0 mt-6 d-flex justify-center">
          <v-img :src="require('@/assets/warning.png')" height="47" contain />
        </v-row>
        <v-row class="mx-0 mt-6 mb-3 d-flex justify-center">
          <h2>ERROR ON TRANSACTION</h2>
        </v-row>
        <v-col cols="12" align-self="center" class="pt-0">
            <v-row>
                <v-col offset="2" cols="8">
                    <p class="justify-center">{{ error.userMessage }}</p>
                </v-col>
            </v-row>
            <v-row v-if="showDevError">
                <v-col offset="2" cols="8">
                    <p class="justify-center">{{ error.technicalMessage }}</p>
                </v-col>
            </v-row>
            <v-row v-if="showDevError">
                <v-col offset="2" cols="8">
                    <p class="justify-center">
                        Service: {{ error.serviceName }} - Method: {{ error.triggeredByMethod }}
                    </p>
                </v-col>
            </v-row>
            <v-row class="ma-0 my-4" justify="space-around">
                <v-btn width="200" height="50" variant="outlined" rounded color="#000000"
                @click="toExchange">
                <span class="blackish">Return to home</span>
                </v-btn>
                <v-btn width="145" height="50"
                dense rounded color="#000000" @click="closeErrorDialog">
                <span class="whiteish">Close</span>
                </v-btn>
            </v-row>
        </v-col>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import ServiceError from '@/common/utils/ServiceError';
import { ref, defineComponent, PropType } from 'vue';

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

    const showDevError = EnvironmentAccessorService.getEnvironmentVariables().debugMode;

    function toExchange() {
      window.location.href = '/';
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
