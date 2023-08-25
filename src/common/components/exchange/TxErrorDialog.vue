<template>
  <v-dialog v-model="showTxErrorDialog" width="470" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-4 d-flex justify-center">
        <v-img :src="warningIconPath" height="47" contain />
      </v-row>
      <v-row class="mx-0 mt-3 mb-3 d-flex justify-center">
        <h2>ERROR ON TRANSACTION</h2>
      </v-row>
      <v-col cols="12" align-self="center" class="pt-0">
        <v-col offset="2" cols="8">
          <p class="justify-center">{{ errorMessage }}</p>
        </v-col>
        <v-row class="mx-0 mb-10" justify="space-around">
          <v-btn width="200" height="50" dense outlined rounded color="#000000" @click="toExchange">
            <span class="blackish">Return to home</span>
          </v-btn>
          <v-btn width="145" height="50" dense rounded color="#000000" @click="closeErrorDialog">
            <span class="whiteish">Close</span>
          </v-btn>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import WarningIcon from '@/assets/warning.png';

export default {
  name: 'TxErrorDialog',
  props: {
    showTxErrorDialog: Boolean,
    errorMessage: String,
  },
  setup(props, context) {
    const warningIconPath = WarningIcon;

    function toExchange() {
      window.location.href = '/';
    }

    function closeErrorDialog() {
      context.emit('closeErrorDialog', props.showTxErrorDialog);
    }

    return {
      warningIconPath,
      toExchange,
      closeErrorDialog,
    };
  }
}
</script>
