<template>
  <v-app-bar color="#fff" elevation="1">
    <div class="container">
      <v-row class="top" >
        <v-col cols="2" class="d-flex justify-start align-center">
          <v-img @click="toExchange" src="@/assets/rsk.png" height="40" width="120" contain/>
        </v-col>
        <v-col cols="8" class="d-flex justify-start align-center">
          <v-col cols="3">
            <a @click="toExchange">
              Home
            </a>
          </v-col>
          <v-col cols="5">
            <a @click="toTransactions">
              Transaction Status
            </a>
          </v-col>
        </v-col>
        <v-col cols="2" class="d-flex justify-end align-center">
          <p>
            English▿
          </p>
        </v-col>
      </v-row>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';

@Component
export default class Top extends Vue {
  @Emit()
  toExchange() {
    if (this.$router.currentRoute.name === 'Exchange') this.$router.go(0);
    this.$router.push({ name: 'Exchange' });
  }

  @Emit()
  toTransactions() {
    if (this.$router.currentRoute.name === 'Status') this.$router.go(0);
    this.$router.push({ name: 'Status' });
  }
}
</script>
