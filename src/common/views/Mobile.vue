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
    const copy = 'The mobile functionality is not currently implemented. Redirect to your computer to use the service. Thank you.';

    return {
      copy,
    };
  },
};
</script>
