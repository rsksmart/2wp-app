<template>
    <v-dialog v-model="showWarningMessage" width="870" persistent>
      <v-card class="container dialog">
        <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
          <h2 class="bg-purple px-2">Review conditions</h2>
        </v-row>
        <v-col cols="12" align-self="center" class="pt-0 mt-3">
          <v-col offset="1" cols="10">
            <v-row>
              <p class="justify-center">
                Some values may have changed slightly. Please review before proceeding.
              </p>
            </v-row>
            <v-row>
              <p class="justify-center">
                Please note that these values are estimates based on current market values.
              </p>
            </v-row>
          </v-col>
          <v-row class="mx-0 mb-8 mt-3" justify="space-around">
            <v-col class="d-flex justify-center">
              <v-btn-rsk @click="send">
                <span>Ok</span>
              </v-btn-rsk>
            </v-col>
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { mdiAlertOutline } from '@mdi/js';

export default defineComponent({
  name: 'QuoteDiffDialog',
  props: {
    showDialog: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showWarningMessage = toRef(props, 'showDialog');

    const send = () => {
      showWarningMessage.value = false;
      emit('continue');
    };

    return {
      send,
      showWarningMessage,
      mdiAlertOutline,
    };
  },
});
</script>
