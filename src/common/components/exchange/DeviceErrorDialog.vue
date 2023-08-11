<template>
  <v-dialog v-model="show" width="470" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-6 d-flex justify-center">
        <v-img :src="require('@/assets/warning.png')" height="47" contain />
      </v-row>
      <v-row class="mx-0 mt-6 mb-3 d-flex justify-center">
        <h2>ERROR CONNECTING TO WALLET</h2>
      </v-row>
      <v-col cols="12" align-self="center" class="pt-0" v-if="errorType">
        <v-col offset="2" cols="8">
          <p class="justify-center"><span v-html="errorMessage"></span></p>
          <p class="justify-center" v-if="urlToMoreInformation">
            <a target='_blank' :href='urlToMoreInformation'>{{messageToUserOnLink}}</a>
          </p>
        </v-col>
        <v-row class="mx-0 my-6" justify="space-around">
          <v-btn width="200" height="50" variant="outlined" rounded color="#000000" @click="toExchange">
            <span class="blackish">Return to home</span>
          </v-btn>
          <v-btn v-if="installationLink && messageInstallationToUser" width="145" height="50"
            dense rounded color="#000000" :href='installationLink' target="_blank">
            <span class="whiteish">{{messageInstallationToUser}}</span>
          </v-btn>
        </v-row>
      </v-col>
      <v-col v-else cols="12" align-self="center" class="pt-0">
        <v-col offset="3" cols="6">
          <p class="justify-center"><span v-html="errorMessage"></span></p>
        </v-col>
        <v-row class="mx-0 my-6" justify="space-around">
          <v-btn width="200" height="50" variant="outlined" rounded color="#000000" @click="toExchange">
            <span class="blackish">Return to home</span>
          </v-btn>
          <v-btn id="err-dialog-close" width="145" height="50" dense
                 rounded color="#000000" @click="closeErrorDialog">
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

// @Component
// class DeviceErrorDialog extends Vue {
//   @Prop() showErrorDialog!: boolean;
//
//   @Prop() errorMessage!: string;
//
//   @Prop() errorType!: string;
//
//   @Prop() urlToMoreInformation!: string;
//
//   @Prop() messageToUserOnLink!: string;
//
//   @Prop() installationLink!: string;
//
//   @Prop() messageInstallationToUser!: string;
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
//     return this.showErrorDialog;
//   }
// }
</script>
