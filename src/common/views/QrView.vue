<template>
  <v-container fluid class="normalized-height container max-width">
    <v-row class="d-flex justify-center">
      <v-col xs="10" sm="8" md="7" lg="5" xl="5" class="d-flex space-between flex-column">
        <send-qr :qr="qr.image" :network="network"
          :amount="qr.amount" :address="qr.address"></send-qr>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Networks } from '@/common/store/constants';
import { computed, defineComponent, PropType } from 'vue';
import SendQr from '@/common/components/exchange/SendQr.vue';
import { PeginQuote, QuotePegOut2WP } from '@/common/types';
import { useGetter } from '@/common/store/helper';
import * as constants from '@/common/store/constants';

export default defineComponent({
  name: 'QrView',
  components: {
    SendQr,
  },
  props: {
    network: {
      type: String as PropType<Networks>,
      required: true,
    },
  },
  setup(props) {
    const peginQuote = useGetter<PeginQuote>('flyoverPegin', constants.FLYOVER_PEGIN_GET_SELECTED_QUOTE);
    const pegoutQuote = useGetter<QuotePegOut2WP>('flyoverPegout', constants.FLYOVER_PEGOUT_GET_SELECTED_QUOTE);

    const qrData = {
      BITCOIN: {
        image: peginQuote.value?.lpsAddressQrCode,
        amount: peginQuote.value?.valueToTransfer,
        address: peginQuote.value?.quote.lpBTCAddr,
      },
      ROOTSTOCK: {
        image: pegoutQuote.value?.lpsAddressQrCode,
        amount: pegoutQuote.value?.quote.value,
        address: pegoutQuote.value?.quote.liquidityProviderRskAddress,
      },
    };

    const qr = computed(() => qrData[props.network as keyof typeof qrData]);

    return {
      qr,
    };
  },
});
</script>
