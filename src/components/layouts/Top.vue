<template>
  <v-app-bar color="#fff" elevation="0" class="mx-8 top">
    <v-row justify="center">
      <v-col cols="11" class="pb-0 pt-10 pl-2 pr-0">
            <v-img @click="toExchange" position="center left"
                   src="@/assets/logo-beta.svg"
                   alt="RSK Two Way Peg"
                   height="65" width="180" contain class="rsk-main-logo"/>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';

@Component
export default class Top extends Vue {
  @Emit()
  toExchange() {
    if (this.$router.currentRoute.name !== 'Home') this.$router.push({ name: 'Home' });
  }
}
</script>
