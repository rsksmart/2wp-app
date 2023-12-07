<!-- eslint-disable max-len -->
<template>
    <v-dialog v-model:model-value="show" width="650" persistent>
      <v-card class="container dialog">
        <v-row class="mx-0 mt-6 d-flex justify-center">
          <v-img :src="require('@/assets/common/terms-conditions.png')" height="60" contain />
        </v-row>
        <v-row class="mx-0 mt-6 mb-3 d-flex justify-center">
          <h2>Terms and conditions</h2>
        </v-row>
        <v-row>
          <v-container class="terms-txt mx-15 my-6 pa-10" @scroll="onScroll">
            <v-row>
              <p>{{ $props.text }}</p>
            </v-row>
           </v-container>
        </v-row>
        <v-row class="d-flex justify-end mx-11 my-5">
          <v-btn rounded variant="outlined" color="#000000" width="110" @click="closeDialog"
                 :disabled="!scrolledText">
            <span>Back</span>
          </v-btn>
        </v-row>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import { ref, defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'TermsDialog',
  props: {
    showDialog: Boolean,
    text: String,
  },
  setup(props, context) {
    const show = computed(() => props.showDialog);
    const scrolledText = ref(false);

    function closeDialog() {
      context.emit('closeDialog', props.showDialog);
    }
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

    return {
      closeDialog,
      show,
      scrolledText,
      onScroll,
    };
  },
});
</script>
