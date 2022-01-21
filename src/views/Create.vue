<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6">
    <bitcoin-form/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BitcoinForm from '@/components/create/BitcoinForm.vue';

@Component({
  components: {
    BitcoinForm,
  },
})
export default class Create extends Vue {
}
</script>
