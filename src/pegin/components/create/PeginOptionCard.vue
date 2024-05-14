<template>
  <v-card :ripple="false" @click="selectOption" rounded="lg" flat variant="outlined"
    :class="selected && 'selected'"
    class="d-flex flex-column ga-4 pa-8 fill-height">
    <span class="text-h4">{{ header.title }}</span>
    <v-row no-gutters>
      <v-col cols="3">
        <div class="d-flex text-h3 ga-1 flex-wrap">
          <span v-for="(word, i) in header.subtitle.split(' ')" :key="i"
            :class='`pa-2 bg-${header.subtitleColor}`'>
            {{ word }}
          </span>
        </div>
      </v-col>
    </v-row>
    <div class="d-flex flex-column ga-2 py-4">
      <span>Destination Address</span>
      <!-- TODO: Replace with input with validations or connected account -->
      <div v-if="rskAddress" class="bg-surface py-2 px-4 rounded-lg border">
        <p class="text-bw-400">
          Connected Wallet {{ rskAddress.slice(0, 6) }}...{{ rskAddress.slice(-4) }}
        </p>
      </div>
      <v-text-field v-else variant="solo" flat rounded="lg" hide-details
      placeholder="Enter Rootstock address"
      density="compact"
      >
    </v-text-field>
    </div>
    <!-- TODO: Use real values -->
    <span class="text-h4">Features</span>
    <div class="d-flex flex-column">
      <span>Title</span>
      <span class="text-bw-400">Value</span>
    </div>
    <v-spacer class="fill-height" />
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import * as constants from '@/common/store/constants';
import { mdiInformationOutline } from '@mdi/js';
import { useStateAttribute } from '@/common/store/helper';

export default defineComponent({
  name: 'PeginOptionCard',
  components: {
  },
  props: {
    optionType: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const account = useStateAttribute<string>('web3Session', 'account');
    const rskAddress = computed(() => account.value || '');

    const headerOptions = {
      native: {
        title: 'Native (For Advanced Users)',
        subtitle: 'Maximum Security',
        subtitleColor: 'purple',
      },
      flyover: {
        title: 'Flyover (For Less Advanced Users)',
        subtitle: 'Faster Option',
        subtitleColor: 'orange',
      },
    };
    const header = computed(() => headerOptions[props.optionType as keyof typeof headerOptions]);

    function selectOption() {
      context.emit('selected-option', props.optionType);
    }

    return {
      constants,
      mdiInformationOutline,
      selectOption,
      header,
      rskAddress,
    };
  },
});
</script>
<style scoped lang="scss">
.v-card--variant-outlined {
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  &.selected {
    border-color: rgba(var(--v-border-color), 1);
  }
}
</style>
