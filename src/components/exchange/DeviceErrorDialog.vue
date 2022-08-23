<template>
  <v-dialog v-model="showErrorDialog" width="470" persistent>
    <v-card class="container dialog">
      <v-row class="mx-0 mt-4 d-flex justify-center">
        <v-img :src="warningIconPath" height="47" contain />
      </v-row>
      <v-row class="mx-0 mt-3 mb-3 d-flex justify-center">
        <h2>ERROR CONNECTING DEVICE</h2>
      </v-row>
      <v-col cols="12" align-self="center" class="pt-0" v-if="errorType">
        <v-col offset="3" cols="6">
          <p class="justify-center"><span v-html="errorMessage"></span></p>
          <p class="justify-center">
            <a target='_blank' :href='urlToMoreInformation'>{{messageToUserOnLink}}</a>
          </p>
        </v-col>
        <v-row class="mx-0 mb-10" justify="space-around">
          <v-btn width="200" height="50" dense outlined rounded color="#00B520" @click="toExchange">
            <span class="greenish">Return to home</span>
          </v-btn>
          <v-btn width="145" height="50" dense rounded color="#00B520" @click="closeErrorDialog">
            <span class="whiteish">Retry</span>
          </v-btn>
        </v-row>
      </v-col>
      <v-col v-else cols="12" align-self="center" class="pt-0">
        <v-col offset="3" cols="6">
          <p class="justify-center"><span v-html="errorMessage"></span></p>
        </v-col>
        <v-row class="mx-0 mb-10" justify="space-around">
          <v-btn width="200" height="50" dense outlined rounded color="#00B520" @click="toExchange">
            <span class="greenish">Return to home</span>
          </v-btn>
          <v-btn width="145" height="50" dense rounded color="#00B520" @click="closeErrorDialog">
            <span class="whiteish">Retry</span>
          </v-btn>
        </v-row>
      </v-col>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  Component, Prop, Emit, Vue,
} from 'vue-property-decorator';
import WarningIcon from '@/assets/warning.png';

@Component
export default class DeviceErrorDialog extends Vue {
  @Prop() showErrorDialog!: boolean;

  @Prop() errorMessage!: string;

  @Prop() errorType!: string;

  @Prop() urlToMoreInformation!: string;

  @Prop() messageToUserOnLink!: string;

  warningIconPath = WarningIcon;

  @Emit()
  toExchange() {
    if (this.$router.currentRoute.name === 'Create') this.$router.go(0);
    this.$router.push({ name: 'Home' });
  }

  @Emit('closeErrorDialog')
  closeErrorDialog() {
    return this.showErrorDialog;
  }
}
</script>
