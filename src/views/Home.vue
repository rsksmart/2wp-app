<template>
  <div>
    <div class="d-flex align-center justify-center">
      <v-dialog v-model="showDialog" width="55%" :persistent="showDialog">
        <v-card color="#FFF" class="container dialog">
          <v-row class="mx-0">
            <v-col cols="2" class="d-flex justify-start">
              <v-btn class="skip-button" text @click="toExchange">
                Skip
              </v-btn>
            </v-col>
            <v-col/>
            <v-col cols="2" class="d-flex justify-end align-start">
              <v-tooltip left color="#C4C4C4">
                <template v-slot:activator="{ on, attrs }">
                  <a target="_blank" href="https://developers.rsk.co/">
                    <v-icon color="#C4C4C4" small v-bind="attrs" v-on="on">mdi-help-circle</v-icon>
                  </a>
                </template>
                <span class="tooltip text-center d-flex justify-center">
                Click on the icon to <br> redirect to de DevPortal
              </span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row class="mx-0 my-10 d-flex justify-center">
            <h1 class="text-center">Keep in mind!</h1>
          </v-row>
          <v-row class="mx-8 d-flex justify-center">
            <p class="text-center">
              Remember that at the moment of the BTC to RBTC conversion process, you will need to
              wait 16-17 hours which is the equivalent of 100 confirmations in order to view your
              RBTC funds.
            </p>
          </v-row>
          <v-row class="mx-0 my-10 justify-center">
            <v-btn class="button" @click="toExchange">
              Get Started
            </v-btn>
          </v-row>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';

@Component
export default class Home extends Vue {
  showDialog = true;

  @Emit()
  toExchange() {
    this.showDialog = false;
    this.$router.push({ name: 'Exchange' });
  }
}
</script>
