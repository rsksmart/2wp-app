<template>
  <v-dialog v-model="show" width="470" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-4 d-flex justify-center">
        <v-img :src="require('@/assets/warning.png')" height="47" contain />
      </v-row>
      <v-row class="mx-0 my-4 d-flex justify-center">
        <h2>ERROR ON TRANSACTION</h2>
      </v-row>
      <v-col cols="12" align-self="center" class="pt-0">
        <v-col offset="2" cols="8">
          <p class="justify-center">{{ errorMessage }}</p>
        </v-col>
        <v-row class="ma-0 my-4" justify="space-around">
          <v-btn width="200" height="50" variant="outlined" rounded color="#000000" @click="toExchange">
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
import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'TxErrorDialog',
  props: {
    showTxErrorDialog: Boolean,
    errorMessage: String,
  },
  setup(props, context) {
    const show = ref(props.showTxErrorDialog);

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
    };
  },
});

// @Component
// class TxErrorDialog extends Vue {
//   @Prop() showTxErrorDialog!: boolean;
//
//   @Prop() errorMessage!: string;
//
//   warningIconPath = WarningIcon;
//
//   @Emit()
//   // eslint-disable-next-line class-methods-use-this
//   toExchange() {
//     window.location.href = '/';
//   }
//
//   @Emit('closeErrorDialog')
//   closeErrorDialog() {
//     return this.showTxErrorDialog;
//   }
// }
</script>
