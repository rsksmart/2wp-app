<template>
    <v-dialog v-model="show" width="650" persistent>
      <v-card class="container dialog">
        <v-row class="mx-0 mt-6 d-flex justify-center">
          <v-img :src="require('@/assets/common/terms-conditions.png')" height="60" contain />
        </v-row>
        <v-row class="mx-0 mt-6 mb-3 d-flex justify-center">
          <h2>Terms and conditions</h2>
        </v-row>
        <v-row>
          <v-container class="terms-txt mx-15 my-6 pa-10" @scroll="onScroll" ref="scrollableArea">
            <v-row>
              <p>{{ dialogText }}</p>
            </v-row>
           </v-container>
        </v-row>
        <v-row class="d-flex justify-end mx-11 my-5">
          <v-btn rounded variant="outlined" color="#000000" width="110"
                 @click="$emit('update:showDialog', false)"
                 :disabled="requiresScroll && !scrolledText ">
            <span>Back</span>
          </v-btn>
        </v-row>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import {
  ref, defineComponent, computed, watchEffect,
} from 'vue';
import { useStateAttribute } from '@/common/store/helper';
import { Feature } from '@/common/types';

export default defineComponent({
  name: 'TermsDialog',
  props: {
    showDialog: Boolean,
  },
  setup(props, context) {
    const areTermsAccepted = useStateAttribute<boolean>('web3Session', 'acceptedTerms');
    const termsAndConditionsEnabled = useStateAttribute<Feature>('web3Session', 'termsAndConditionsEnabled');
    const dialogText = computed(() => termsAndConditionsEnabled.value?.value);
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

    return {
      show,
      scrolledText,
      onScroll,
      dialogText,
      scrollableArea,
      requiresScroll,
      areTermsAccepted,
    };
  },
});
</script>
