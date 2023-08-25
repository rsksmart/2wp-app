<template>
  <v-tooltip v-model="isTooltipShowed" top :open-on-click="false" :open-on-hover="false">
    <template v-slot:activator="{ attrs }">
      <span
        :class="textStyles"
        :id="id"
        @dblclick="handleDblClick"
        v-bind="attrs"
      >
        {{ textValue }}
      </span>
    </template>
    <span>Copied</span>
  </v-tooltip>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  name: 'TxSummaryField',
  props: {
    textStyles: String,
    textValue: String,
    id: String,
  },
  setup(props, context) {
    const isTooltipShowed = ref(false);

    function handleDblClick() {
      isTooltipShowed.value = true;
      setTimeout(() => { isTooltipShowed.value = false; }, 1000);
      context.emit('copyToClipboard', props.id);
    }

    return {
      isTooltipShowed,
      handleDblClick,
    };
  }
}
</script>