<template>
  <v-container class="form-step">
    <v-row align="start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">1</div>
      </v-col>
      <v-col class="pl-0 mb-4">
        <p v-bind:class="{'boldie': focus}">
          Connect your RSK wallet:
        </p>
        <v-row>
          <v-btn outlined rounded color="#00B520" width="100%" height="38"
                 @click="connectWallet" @focus="focus = true" @blur="focus = false">
            <span class="greenish">Connect wallet</span>
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator';

@Component({})
export default class RskWalletConnection extends Vue {
  focus = true;

  @Emit()
  // eslint-disable-next-line class-methods-use-this
  connectWallet() {
    console.log('connecting to wallet');
  }
}
</script>
