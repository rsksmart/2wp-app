<template>
  <v-card class="d-flex pa-10 fill-height selected"
  rounded="lg" flat variant="outlined"
  :hover="false"
  :ripple="false"
  >
    <v-container fluid>
      <v-row class="d-flex justify-center">
        <p class="text-h6">Send funds to the {{ networkNameTicker }} address below</p>
      </v-row>
      <v-row class="d-flex my-10">
        <p class="text-h7 text-orange font-weight-bold d-flex justify-center text-center">
          This is a unique {{ networkTicker }} Address available for 1 hour.
          If you send a different amount, the transaction might fail.</p>
      </v-row>
      <v-row class="d-flex justify-center px-4 my-4">
        <v-divider class="border-opacity-100"/>
      </v-row>
      <v-row class="d-flex justify-center text-center ma-0">
        <p class="text-subtitle-2">Amount to send</p>
      </v-row>
      <v-row class="d-flex justify-center text-center my-2">
        <p class="text-h4">{{ amount }} {{ networkTicker }}</p>
      </v-row>
      <v-row class="d-flex justify-center text-center my-2">
        <p class="text-body-1 text-bw-500">{{ amountUsd }} USD</p>
      </v-row>
      <v-row class="d-flex justify-center my-2">
        <v-img
          :src="image"
          :alt="`QR code for ${network}`"
          class="mx-auto"
          width="260"
          height="260"
          contain/>
      </v-row>
      <v-row class="d-flex justify-center text-center my-4">
        <p class="text-subtitle-2">{{ networkNameTicker }} address</p>
      </v-row>
      <v-row class="d-flex justify-center text-center px-2">
        <v-text-field variant="outlined" class="address-field"
        :disabled="true" :model-value="address"/>
      </v-row>
  </v-container>
  </v-card>

</template>

<script lang="ts">
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { Networks } from '@/common/store/constants';
import { useStateAttribute } from '@/common/store/helper';
import { SatoshiBig } from '@/common/types';
import {
  computed, defineComponent, PropType, ref,
} from 'vue';

export default defineComponent({
  name: 'SendQr',
  props: {
    qr: String,
    network: {
      type: String as PropType<Networks>,
      required: true,
    },
    amount: String,
    address: String,
  },
  setup(props) {
    const image = ref(props.qr);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const fixedUSDDecimals = 2;
    const VALUE_INCOMPLETE_MESSAGE = '-';

    const bitcoinPrice = useStateAttribute<number>('web3Session', 'bitcoinPrice');

    const networkNameTicker = computed(() => (
      props.network === Networks.BITCOIN
        ? environmentContext.getBtcText()
        : environmentContext.getRskText()
    ));

    const networkTicker = computed(() => (
      props.network === Networks.BITCOIN
        ? environmentContext.getBtcTicker()
        : environmentContext.getRbtcTicker()
    ));

    const amountUsd = computed(() => {
      const btcAmount = new SatoshiBig(props.amount || 0, 'btc');
      if (!btcAmount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      return btcAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    return {
      image,
      networkNameTicker,
      networkTicker,
      amountUsd,
    };
  },
});
</script>
