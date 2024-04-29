<template>
  <header class="d-flex justify-space-between align-center py-4 px-8">
    <div class="d-flex align-center ga-2">
      <v-img inline width="160" alt="Rootstock logo" class="cursor-pointer"
        :src="getLogoSrc()" @click="goHome">
      </v-img>
      <h1 class="text-purple text-h5">2 Way Peg</h1>
    </div>
    <v-switch inset hide-details base-color="purple" @click="toggleTheme" />
  </header>
</template>

<script lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';

export default {
  name: 'TopBar',
  setup() {
    const router = useRouter();
    const route = useRoute();
    function goHome() {
      if (route.name !== 'Home') router.push({ name: 'Home' });
    }

    const { global: { current, name } } = useTheme();
    function toggleTheme() {
      name.value = current.value.dark ? 'light' : 'dark';
    }
    function getLogoSrc() {
      return current.value.dark ? require('@/assets/logo-rootstock-white.svg') : require('@/assets/logo-rootstock-black.svg');
    }

    return {
      goHome,
      toggleTheme,
      getLogoSrc,
    };
  },
};
</script>
