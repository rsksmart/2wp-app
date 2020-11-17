<template>
  <v-navigation-drawer permanent app color="#1732A4" class="drawer">
    <v-row class="mx-0 mt-auto d-flex justify-center">
      <v-col cols="3" class="d-flex justify-center">
        <span class="number text-center">1</span>
      </v-col>
      <v-col cols="6">
        Select
      </v-col>
    </v-row>
    <v-row class="mx-0 d-flex justify-center">
      <v-col cols="3" class="d-flex justify-center">
        <p class="number text-center">2</p>
      </v-col>
      <v-col cols="6">
        Send Bitcoin
      </v-col>
    </v-row>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default Vue.extend({
  name: 'Drawer',
});
</script>
