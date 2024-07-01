<template>
  <v-dialog v-model="show" width="500" persistent>
    <v-card class="d-flex pa-6" rounded="lg">
      <div class="d-flex">
        <h2 class="text-h3 bg-purple pa-2">Error connecting to wallet</h2>
      </div>
      <div class="d-flex flex-column ga-1 mt-3 px-0">
        <p>{{ errorMessage }}</p>
        <p v-if="urlToMoreInformation">
          <a target='_blank' :href='urlToMoreInformation'>{{messageToUserOnLink}}</a>
        </p>
        <div class="mt-8 d-flex justify-space-around">
          <v-btn-rsk @click="toExchange">
            <span>Return to home</span>
          </v-btn-rsk>
          <v-btn-rsk v-if="installationLink && messageInstallationToUser"
            :href='installationLink' target="_blank">
            <span>{{messageInstallationToUser}}</span>
          </v-btn-rsk>
          <v-btn-rsk v-if="!errorType" @click="closeErrorDialog">
            <span>Close</span>
          </v-btn-rsk>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'DeviceErrorDialog',
  props: {
    showErrorDialog: Boolean,
    errorMessage: String,
    errorType: String,
    urlToMoreInformation: String,
    messageToUserOnLink: String,
    installationLink: String,
    messageInstallationToUser: String,
  },
  setup(props, context) {
    const show = ref(props.showErrorDialog);

    function toExchange() {
      window.location.href = '/';
    }

    function closeErrorDialog() {
      context.emit('closeErrorDialog', props.showErrorDialog);
    }

    return {
      toExchange,
      closeErrorDialog,
      show,
    };
  },
});
</script>
