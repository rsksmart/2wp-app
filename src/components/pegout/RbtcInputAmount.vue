<template>
  <v-container class="form-step">
    <v-row align="start mx-0">
      <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
              'number-filled' : 'number']">2</div>
      </v-col>
      <v-col class="pl-0 mb-4">
        <p v-bind:class="{'boldie': focus}">
          Enter the amount you want to send:
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class RbtcInputAmount extends Vue {
  focus = false;
}
</script>
