<template>
  <v-app-bar color="#FFFFFF" elevation="1">
    <v-row class="top">
      <v-col cols="3" class="d-flex align-center">
        <v-img src="@/assets/rsk.png" height="40" contain/>
      </v-col>
      <v-col cols="2" class="d-flex justify-center align-center">
        <router-link :to="{ name: 'Exchange' }">
          Home
        </router-link>
      </v-col>
      <v-col cols="3" class="d-flex justify-center align-center">
        <router-link :to="{ name: 'Transactions' }">
          Transaction Status
        </router-link>
      </v-col>
      <v-spacer/>
      <v-col cols="2" class="d-flex justify-end align-center">
        <p class="mb-0 blackish">English</p>
      </v-col>
    </v-row>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class Top extends Vue {}
</script>
