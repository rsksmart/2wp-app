<template>
  <v-row class="mx-0 d-flex justify-center">
    <v-col sm="10"
           md="9"
           lg="8"
           xl="7">
      <v-row justify="center" class="mx-0 pb-4">
        <h3 class="text-center tx-text">Advanced data:</h3>
      </v-row>
      <v-row class="d-flex justify-center mb-n3">
        <v-btn class="btn-focus-out" size="x-small" variant="outlined" rounded @click="switchExpand"
               v-bind:class="[over ? 'expand-btn-active' : 'expand-btn-inactive']"
               @mouseover="over = true" @mouseleave="over = false">
          <span class="content">
            {{ expanded ? '-' : '+'}}
          </span>
        </v-btn>
      </v-row>
      <v-expand-transition>
        <div class="box" v-show="expanded">
          <v-row class="mx-0 py-2 px-2">
            <v-col class="py-6 px-5">
              <v-row class="mx-0">
                <h3>Unsigned raw tx</h3>
              </v-row>
              <v-row class="mx-0 text-break">
                <span>{{ rawTx }}</span>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script lang="ts">

import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'AdvancedData',
  props: {
    initialExpand: Boolean,
    rawTx: String,
  },
  setup(props) {
    const expanded = ref(props.initialExpand);
    const over = ref(false);

    function switchExpand() {
      expanded.value = !expanded.value;
    }

    return {
      expanded,
      over,
      switchExpand,
    };
  },
});
</script>
