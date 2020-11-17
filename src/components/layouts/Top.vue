<template>
  <v-app-bar class="top d-flex justify-center" color="transparent" flat>
    <router-link class="mx-10" :to="{ name: 'Home' }">
      Exchange
    </router-link>
    <router-link class="mx-10">
      Transactions
    </router-link>
    <router-link class="mx-10">
      Help
    </router-link>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default Vue.extend({
  name: 'Top',
});
</script>
