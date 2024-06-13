<template>
    <v-dialog v-model="show" width="650" :persistent="!areTermsAccepted">
      <v-card class="container dialog pa-3">
        <v-row class="d-flex justify-end mr-3 mt-3">
          <v-btn variant="plain" :icon="mdiCloseCircleOutline"
          size="regular" @click="close" >
          </v-btn>
        </v-row>
        <v-row class="mx-0 mb-3 d-flex justify-center">
          <div class="d-flex text-h3 ga-1 flex-wrap">
            <span class='pa-2 bg-purple'>
              Terms and conditions
            </span>
          </div>
        </v-row>
        <v-row class="mx-15 my-6">
          <v-container class="terms-txt" @scroll="onScroll" ref="scrollableArea">
            <v-row class="pa-4 ma-0">
              <p>{{ dialogText }}</p>
            </v-row>
           </v-container>
        </v-row>
        <v-row class="d-flex justify-end mx-11 my-5">
          <v-btn-rsk rounded variant="flat" width="110"
                 @click="close"
                 :disabled="requiresScroll && !scrolledText && !areTermsAccepted">
            <span>Back</span>
          </v-btn-rsk>
        </v-row>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import {
  ref, defineComponent, computed, watchEffect,
} from 'vue';
import { useGetter, useStateAttribute } from '@/common/store/helper';
import { Feature, FeatureNames } from '@/common/types';
import { mdiCloseCircleOutline } from '@mdi/js';
import * as constants from '@/common/store/constants';

export default defineComponent({
  name: 'TermsDialog',
  props: {
    showDialog: Boolean,
  },
  setup(props, context) {
    const areTermsAccepted = useStateAttribute<boolean>('web3Session', 'acceptedTerms');
    const getFeature = useGetter<(f:FeatureNames) =>Feature>('web3Session', constants.SESSION_GET_FEATURE);
    const dialogText = computed(() => {
      const currentTernms = getFeature.value(FeatureNames.TERMS_AND_CONDITIONS);
      return currentTernms.value;
    });
    const show = computed({
      get() {
        return props.showDialog;
      },
      set(value) {
        context.emit('update:showDialog', value);
      },
    });
    const scrolledText = ref(false);
    const scrollableArea = ref();
    const requiresScroll = ref();

    function onScroll(
      event: { target: { scrollTop: number; clientHeight: number; scrollHeight: number; }},
    ) {
      const { target: { scrollTop, clientHeight, scrollHeight } } = event;
      if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
        scrolledText.value = true;
      } else {
        scrolledText.value = false;
      }
    }

    watchEffect(() => {
      if (scrollableArea.value) {
        const el = scrollableArea.value.$el;
        requiresScroll.value = el.scrollHeight > el.clientHeight;
        scrolledText.value = false;
      }
    });

    function close() {
      context.emit('update:showDialog', false);
    }

    return {
      show,
      scrolledText,
      onScroll,
      dialogText,
      scrollableArea,
      requiresScroll,
      areTermsAccepted,
      mdiCloseCircleOutline,
      close,
    };
  },
});
</script>
