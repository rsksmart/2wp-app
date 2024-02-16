<template>
  <v-dialog persistent width="500">
    <v-card class="pa-8 text-center">
      <v-card-title class="font-weight-bold">{{ title }}</v-card-title>
        <v-card-text>{{ text }}</v-card-text>
      <v-progress-linear class="mt-2" indeterminate />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingDialog',
  props: {
    title: String,
    text: String,
  },
  setup() {
    return {};
  },
});
</script>
