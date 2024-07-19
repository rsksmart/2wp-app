<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';
import { useGetter } from '@/common/store/helper';
import { Feature, FeatureNames } from '@/common/types';
import * as constants from '@/common/store/constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const md = require('markdown-it')();

export default defineComponent({
  name: 'TermsContent',
  setup() {
    const getFeature = useGetter<(f:FeatureNames) =>Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const termsContent = getFeature.value(FeatureNames.TERMS_AND_CONDITIONS).value || '';
    return () => h('div', { innerHTML: md.render(termsContent) });
  },
});
</script>
