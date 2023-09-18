<template>
    <v-tooltip v-model="isTooltipShowed" >
      <template v-slot:activator="{props}">
        <span
        :class="textStyles"
        :id="id"
        @dblclick="handleDblClick"
        style="cursor: default;"
        v-bind="props.attrs"
        >
        {{ textValue }}
      </span>
    </template>
    <span>Copied</span>
  </v-tooltip>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';

export default defineComponent({
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
  },
});
</script>
