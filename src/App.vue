<template>
  <v-app>
    <drawer/>
    <div class="custom-background">
      <v-main class="gradient">
        <top/>
        <router-view/>
      </v-main>
    </div>
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import Drawer from '@/components/layouts/Drawer.vue';
import Top from '@/components/layouts/Top.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Drawer,
    Top,
  },
});
</script>
