<template>
  <div class="ma-auto text-center pa-12">
    <h1>Mobile is not available</h1>
    <p>{{ copy }}</p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MobileView',
  setup() {
    const copy = 'Support for Mobile browsers is not supported at this time. '
      + 'Please use desktop browser';

    return {
      copy,
    };
  },
};
</script>
