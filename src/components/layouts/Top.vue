<template>
  <v-app-bar color="#fff" elevation="1">
    <div class="container">
      <v-row class="top" >
        <v-col cols="4" class="d-flex align-center justify-start">
          <v-img @click="toExchange" src="@/assets/rsk.png" height="40" width="120" contain/>
        </v-col>
        <v-col cols="4" class="d-flex justify-center align-center">
          <a @click="toExchange">
            Home
          </a>
        </v-col>
        <v-col cols="4" class="d-flex justify-center align-center">
          <a @click="toTransactions">
            Transaction Status
          </a>
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
    if (this.$router.currentRoute.name === 'Transactions') this.$router.go(0);
    this.$router.push({ name: 'Transactions' });
  }
}
</script>
