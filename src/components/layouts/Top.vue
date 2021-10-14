<template>
  <v-app-bar color="#fff" elevation="0" class="px-12">
      <v-col offset="1" cols="10" offset-xl="2" xl="8" class="px-12 pt-12">
        <v-row class="top mx-0" >
          <v-col cols="2" class="pl-0">
            <v-img @click="toExchange" position="center left"
                   src="@/assets/logo-beta.svg"
                   alt="RSK Two Way Peg"
                   height="60" contain class="rsk-main-logo"/>
          </v-col>
          <v-col class="d-flex justify-end align-center pr-0">
            <v-btn v-if="false" @click="toExchange" color="#00B520" class="whiteish" rounded>
              Create new transaction
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';

@Component
export default class Top extends Vue {
  get inStatus(): boolean {
    return this.$route.name === 'Status' || this.$route.name === 'StatusSearch';
  }

  @Emit()
  toExchange() {
    if (this.$router.currentRoute.name === 'Exchange') this.$router.go(0);
    this.$router.push({ name: 'Exchange' });
  }

  @Emit()
  toTransactions() {
    if (this.$route.path !== '/status') this.$router.push('/status');
  }
}
</script>
