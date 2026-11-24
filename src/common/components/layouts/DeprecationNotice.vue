<template>
  <div class="deprecation-notice d-flex align-center justify-center flex-grow-1 pa-4">
    <v-card class="container dialog deprecation-card pa-8" rounded="lg">
      <h1 class="text-h4 mb-6">The PowPeg App has moved to Atlas</h1>
      <p class="deprecation-message text-body-1 mb-6">{{ message }}</p>
      <v-btn
        color="orange"
        class="mb-6"
        href="https://atlas.rootstock.io/"
        target="_blank"
        rel="noopener">
        Go to Atlas
      </v-btn>
      <div class="d-flex align-baseline flex-wrap">
        <span class="text-body-1">Already made a transaction?</span>
        <v-btn variant="text" color="orange" density="compact"
          class="pa-0 text-body-1 ml-2"
          :to="{ name: 'StatusSearch' }">
          Check your transaction status
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useGetter } from '@/common/store/helper';
import * as constants from '@/common/store/constants';
import { Feature, FeatureNames } from '@/common/types';
import { getDeprecationMessage } from '@/common/utils';

type FeatureGetter = (name: FeatureNames) => Feature | undefined;

export default {
  name: 'DeprecationNotice',
  setup() {
    const getFeature = useGetter<FeatureGetter>('web3Session', constants.SESSION_GET_FEATURE);
    const message = computed(() => getDeprecationMessage(
      getFeature.value(FeatureNames.SUNSET_BANNER_MESSAGE),
    ));

    return {
      message,
    };
  },
};
</script>

<style scoped lang="scss">
.deprecation-card {
  width: 100%;
  max-width: 640px;
}

.deprecation-message {
  white-space: pre-line;
}
</style>
