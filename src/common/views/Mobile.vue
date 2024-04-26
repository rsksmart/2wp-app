<template>
  <v-container v-if="smAndDown" class="mobile" fluid>
    <v-row class="mobile-content mx-0">
      <v-col class="py-0">
        <v-img position="center center" :src="require('@/assets/logo-rootstock-black.png')"
               v-bind:height="sm ? 175 : 105" contain/>
      </v-col>
      <v-col cols="12" class="text-center d-flex flex-column align-center py-0">
        <div v-bind:class="[sm ? 'title-warning-sm' : 'title-warning-xs']">
          <h1>Mobile is not available</h1>
        </div>
        <div v-bind:class="[sm ? 'text-warning-sm' : 'text-warning-xs']">
          <p>The mobile functionality is not currently implemented.
            Redirect to your computer to use the service.</p>
          <p>Thank you</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { useDisplay } from 'vuetify';

export default {
  name: 'MobileView',
  setup() {
    const { sm, smAndDown } = useDisplay();

    return {
      sm,
      smAndDown,
    };
  },
};
</script>
