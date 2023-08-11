<template>
  <v-dialog v-model="show" width="470" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-3 mb-3 d-flex justify-center">
        <h2>WARNING</h2>
      </v-row>
      <v-col cols="12" align-self="center" class="pt-0">
        <v-row class="mx-0 mt-4 mb-5 d-flex justify-center">
          <v-img :src="require('@/assets/warning.png')" height="50" contain />
        </v-row>
        <v-col offset="1" cols="10">
          <p class="justify-center">
            {{address}} may not be a valid address on the
            {{environmentContext.getRskText()}} network.
            Do you want to continue?
          </p>
        </v-col>
        <v-row class="mx-0 mb-8 mt-3" justify="space-around">
          <v-col class="d-flex justify-center">
            <v-btn width="100" height="40" dense
                   outlined rounded color="#000000" @click="cancel">
              <span class="blackish">cancel</span>
            </v-btn>
          </v-col>
          <v-col class="d-flex justify-center">
            <v-btn width="100" height="40" dense outlined rounded color="#000000" @click="send">
              <span class="blackish">continue</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

export default defineComponent({
  name: 'AddressWarningDialog',
  props: {
    showDialog: Boolean,
    address: String,
  },
  setup(props, context) {
    const show = ref(props.showDialog);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();

    function send() {
      context.emit('continue', props.showDialog);
    }

    function cancel() {
      context.emit('cancel', props.showDialog);
    }

    return {
      environmentContext,
      send,
      cancel,
      show,
    };
  },
});

// @Component
// class AddressWarningDialog extends Vue {
//   @Prop() showDialog!: boolean;
//
//   @Prop() address!: string;
//
//   iconPath = WarningImage;
//
//   environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
//
//   @Emit('continue')
//   send() {
//     return this.showDialog;
//   }
//
//   @Emit('cancel')
//   closeDialog() {
//     return this.showDialog;
//   }
// }
</script>
