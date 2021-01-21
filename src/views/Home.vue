<template>
  <div>
    <div class="d-flex align-center justify-center">
      <v-dialog v-model="showDialog" width="470" :persistent="showDialog">
        <v-card color="#FFF" class="container dialog">
          <v-row class="mt-8 mb-5 d-flex justify-center">
            <h1 class="text-center">Keep in mind!</h1>
          </v-row>
          <v-row class="my-2 d-flex justify-center">
            <v-col cols="9">
              <p class="text-center">
                The process must pass 100 confirmations which is the equivalent of 17 hours in order
                to view your converted funds.
              </p>
            </v-col>
          </v-row>
          <v-row class="mb-8 d-flex justify-center">
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
