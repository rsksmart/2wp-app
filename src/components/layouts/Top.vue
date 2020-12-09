<template>
  <v-app-bar class="top d-flex justify-center" color="transparent" flat>
    <router-link class="mx-10" :to="{ name: 'Exchange' }">
      Exchange
    </router-link>
    <router-link class="mx-10" :to="{ name: 'Transactions' }">
      Transactions
    </router-link>
    <router-link class="mx-10" :to="{ name: 'Transactions' }">
      Help
    </router-link>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Top extends Vue {}
</script>
