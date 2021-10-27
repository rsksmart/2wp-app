<template>
  <v-app-bar color="#fff" elevation="0" class="mx-8">
    <v-row justify="center">
      <v-col cols="11" class="pb-0 pt-10 pr-0">
        <v-row justify="center" align="center" class="mx-0" >
          <v-col cols="2" class="pl-0">
            <v-img @click="toExchange" position="center left"
                   src="@/assets/logo-beta.svg"
                   alt="RSK Two Way Peg"
                   height="65" contain class="rsk-main-logo"/>
          </v-col>
          <v-col class="d-flex justify-end align-center pr-0">
            <v-btn color="#00B520" class="whiteish" rounded>
              Need help?
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
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
