<template>
    <v-dialog v-model="showWarningMessage" width="470" persistent>
      <v-card class="container dialog">
        <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
          <h2>{{ warningTitle }}</h2>
        </v-row>
        <v-col cols="12" align-self="center" class="pt-0">
          <v-row class="ma-0 d-flex justify-center">
            <v-icon class="ml-2" color="#000000" :icon="mdiAlertOutline" size="80"></v-icon>
          </v-row>
          <v-col offset="1" cols="10">
            <p class="justify-center">
              {{ warnignMessage }}
            </p>
          </v-col>
          <v-row class="mx-0 mb-8 mt-3" justify="space-around">
            <v-col class="d-flex justify-center">
              <v-btn width="100" height="40" dense outlined rounded color="#000000" @click="send">
                <span class="whiteish">continue</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { mdiAlertOutline } from '@mdi/js';

export default defineComponent({
  name: 'WarningDialog',
  props: {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    showDialog: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showWarningMessage = ref(props.showDialog);
    const warnignMessage = ref(props.message);
    const warningTitle = ref(props.title);

    const send = () => {
      showWarningMessage.value = false;
      emit('continue');
    };

    return {
      send,
      showWarningMessage,
      warnignMessage,
      warningTitle,
      mdiAlertOutline,
    };
  },
});
</script>
