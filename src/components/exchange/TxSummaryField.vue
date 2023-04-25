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
import {
  Component, Emit, Prop, Vue,
} from 'vue-property-decorator';

@Component
export default class TxSummaryField extends Vue {
  @Prop() textStyles !: string;

  @Prop() textValue !: string;

  @Prop() id !: string;

  isTooltipShowed = false;

  @Emit('copyToClipboard')
  handleDblClick() {
    this.isTooltipShowed = true;
    setTimeout(() => { this.isTooltipShowed = false; }, 1000);
    return this.id;
  }
}
</script>
