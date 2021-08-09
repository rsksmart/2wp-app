<template>
  <v-app-bar color="#fff" elevation="1" class="px-0">
    <v-container fluid class="mx-0 px-0">
      <v-col offset="1" cols="10" offset-xl="2" xl="8" class="px-0">
        <v-row class="top mx-0" >
          <v-col cols="2" class="d-flex justify-start align-center pl-0">
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
          <v-col cols="2" class="d-flex justify-end align-center pr-0">
            <p>
              English▿
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-container>
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
