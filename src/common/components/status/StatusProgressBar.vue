<template>
  <v-container class="mx-16">
    <v-row>
      <v-col cols="1" class="pt-0">
        <v-row no-gutters justify="center">
          <v-img class="d-flex flex-0-0" :src="initialStepImage" width="32" height="32" contain/>
        </v-row>
        <v-row>
          <span class="text-center text-bw-400">
            {{ isPegout ? 'Bitcoin Network' : 'Rootstock Network' }}
          </span>
        </v-row>
      </v-col>
      <v-col class="px-0">
        <v-progress-linear color="green" model-value="100" />
      </v-col>
      <template v-if="!isFlyover">
        <v-col cols="auto" class="pt-2 px-1">
          <v-row no-gutters justify="center">
            <v-img :src="require('@/assets/status/ellipse.svg')" width="12" height="12" contain/>
          </v-row>
          <v-row>
          <span class="text-center text-bw-400">
            step
          </span>
          </v-row>
        </v-col>
        <v-col class="px-0">
          <v-progress-linear color="green" model-value="100" />
        </v-col>
        <v-col cols="auto" class="pt-2 px-1">
          <v-row no-gutters justify="center">
            <v-img :src="require('@/assets/status/ellipse.svg')" width="12" height="12" contain/>
          </v-row>
          <v-row>
          <span class="text-center text-bw-400">
            step
          </span>
          </v-row>
        </v-col>
        <v-col class="px-0">
          <v-progress-linear color="green" model-value="30" />
        </v-col>
      </template>
      <v-col cols="1" class="pt-0">
        <v-row no-gutters justify="center">
          <v-img class="d-flex flex-0-0" :src="finalStepImage" width="32" height="32" contain/>
        </v-row>
        <v-row>
          <span class="text-center text-bw-400">
            {{ isPegout ? 'Rootstock Network' : 'Bitcoin Network' }}
          </span>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'StatusProgressBar',
  props: {
    isFlyover: Boolean,
    isPegout: Boolean,
  },
  setup(props) {
    const initialStepImage = computed(() => {
      if (props.isPegout) {
        return require('@/assets/status/btc.svg');
      }
      return require('@/assets/status/rbtc.svg');
    });
    const finalStepImage = computed(() => {
      if (props.isPegout) {
        return require('@/assets/status/rbtc.svg');
      }
      return require('@/assets/status/btc.svg');
    });
    return {
      initialStepImage,
      finalStepImage,
    };
  },
});
</script>
