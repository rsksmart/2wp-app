<template>
  <v-dialog v-model="show" width="470" persistent>
    <v-card class="container dialog" rounded>
      <v-row class="mx-0 mt-6 d-flex justify-center">
        <v-img :src="require('@/assets/warning.svg')" height="47" contain />
      </v-row>
      <v-row class="mx-0 mt-6 mb-3 d-flex justify-center">
        <h2 class="px-4 bg-purple">Error on Transaction</h2>
      </v-row>
      <v-col cols="12" align-self="center" class="pt-0">
        <v-col offset="2" cols="8">
          <p class="justify-center">{{ errorMessage }}</p>
        </v-col>
        <v-row class="ma-0 my-4" justify="space-around">
          <v-btn-rsk @click="toExchange">
            <span>Return to home</span>
          </v-btn-rsk>
          <v-btn-rsk @click="closeErrorDialog">
            <span>Close</span>
          </v-btn-rsk>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'TxErrorDialog',
  props: {
    showTxErrorDialog: Boolean,
    errorMessage: String,
  },
  setup(props, context) {
    const show = ref(props.showTxErrorDialog);
    const router = useRouter();

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
    };
  },
});
</script>
