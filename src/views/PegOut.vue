<template>
  <v-container fluid class="exchange normalized-height container
  max-width mx-6 pt-6">
    <peg-out-form/>
    <v-row class="mx-0">
      <v-col cols="2" class="d-flex justify-start ma-0 pa-0 mt-10">
        <v-btn rounded outlined color="#00B520" width="110" @click="back">
          <span>Back</span>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import PegOutForm from '@/components/pegout/PegOutForm.vue';

@Component({
  components: {
    PegOutForm,
  },
})
export default class PegOut extends Vue {
  @Emit()
  back():void {
    this.$router.push({ name: 'Home' });
  }
}
</script>
