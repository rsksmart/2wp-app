<template>
  <v-alert v-if="message" variant="outlined" type="warning" prominent
    class="sunset-banner flex-0-0 mx-8 mt-4" role="alert">
    <span class="text-break">{{ message }}</span>
  </v-alert>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useGetter } from '@/common/store/helper';
import * as constants from '@/common/store/constants';
import { Feature, FeatureNames } from '@/common/types';
import { getSunsetBannerMessage } from '@/common/utils';

type FeatureGetter = (name: FeatureNames) => Feature | undefined;

export default {
  name: 'SunsetBanner',
  setup() {
    const getFeature = useGetter<FeatureGetter>('web3Session', constants.SESSION_GET_FEATURE);
    const message = computed(() => getSunsetBannerMessage(
      getFeature.value(FeatureNames.SUNSET_BANNER_MESSAGE),
    ));

    return {
      message,
    };
  },
};
</script>

<style scoped lang="scss">
.sunset-banner {
  white-space: pre-line;
}
</style>
