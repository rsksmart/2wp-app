<template>
  <v-container fluid class="normalized-height container max-width">
    <v-row class="d-flex justify-center">
      <v-col cols="4" offset="2" class="d-flex justify-center ma-0">
        <send-qr :qr="image" :network="chain" amount="0.0005" :address="address"></send-qr>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Networks } from '@/common/store/constants';
import { defineComponent, PropType, ref } from 'vue';
import SendQr from '@/common/components/exchange/SendQr.vue';

export default defineComponent({
  name: 'QrView',
  components: {
    SendQr,
  },
  props: {
    address: String,
    network: {
      type: String as PropType<Networks>,
      required: true,
    },
  },
  setup(props) {
    const sendAddress = ref(props.address);
    const chain = ref(props.network);
    const image = 'data:image/png;base64,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';

    return {
      sendAddress,
      chain,
      image,
    };
  },
});
</script>
