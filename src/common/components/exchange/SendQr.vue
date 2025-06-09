<template>
  <v-card class="fill-height selected"
  rounded="lg" flat variant="outlined"
  :hover="false"
  :ripple="false"
  >
    <v-container fluid class="pa-10">
      <v-row no-gutters class="d-flex justify-end mt-n6 mr-n6">
        <v-icon @click="close" :icon="mdiCloseCircleOutline" size="30" />
      </v-row>
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
        <p class="text-h4">{{ amountValue }} {{ networkTicker }}</p>
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
      <v-row class="d-flex justify-center text-center my-4">
        <v-btn-rsk @click="toStatusSearch">
          Search for Transaction ID status
        </v-btn-rsk>
    </v-row>
  </v-container>
  </v-card>

</template>

<script lang="ts">
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import * as constants from '@/common/store/constants';

import { mdiCloseCircleOutline } from '@mdi/js';
import { useStateAttribute, useAction } from '@/common/store/helper';
import { SatoshiBig, WeiBig } from '@/common/types';
import {
  computed, defineComponent, PropType, ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
  name: 'SendQr',
  props: {
    qr: String,
    network: {
      type: String as PropType<constants.QRCodeNetworks>,
      required: true,
    },
    amount: {
      type: Object as PropType<SatoshiBig | WeiBig>,
      required: true,
    },
    address: String,
  },
  setup(props) {
    const image = ref(props.qr);
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const fixedUSDDecimals = 2;
    const VALUE_INCOMPLETE_MESSAGE = '-';

    const bitcoinPrice = useStateAttribute<number>('web3Session', 'bitcoinPrice');
    const clearSession = useAction('web3Session', constants.WEB3_SESSION_CLEAR_ACCOUNT);
    const clearPeginStore = useAction('pegInTx', constants.PEGIN_TX_CLEAR_STATE);
    const clearPegoutStore = useAction('pegOutTx', constants.PEGOUT_TX_CLEAR_STATE);
    const route = useRoute();
    const router = useRouter();

    const networkNameTicker = computed(() => (
      props.network === constants.QRCodeNetworks.BITCOIN
        ? environmentContext.getBtcText()
        : environmentContext.getRskText()
    ));

    const networkTicker = computed(() => (
      props.network === constants.QRCodeNetworks.BITCOIN
        ? environmentContext.getBtcTicker()
        : environmentContext.getRbtcTicker()
    ));

    const amountUsd = computed(() => {
      if (!props.amount || !bitcoinPrice.value) return VALUE_INCOMPLETE_MESSAGE;
      if (props.network === constants.QRCodeNetworks.ROOTSTOCK) {
        const rbtcAmount = props.amount as WeiBig;
        return rbtcAmount.toUSDFromRBTCString(bitcoinPrice.value, fixedUSDDecimals);
      }
      const btcAmount = props.amount as SatoshiBig;
      return btcAmount.toUSDFromBTCString(bitcoinPrice.value, fixedUSDDecimals);
    });

    const amountValue = computed(() => {
      if (!props.amount) return VALUE_INCOMPLETE_MESSAGE;
      if (props.network === constants.QRCodeNetworks.ROOTSTOCK) {
        const rbtcAmount = props.amount as WeiBig;
        return rbtcAmount.toRBTCTrimmedString();
      }
      const btcAmount = props.amount as SatoshiBig;
      return btcAmount.toBTCTrimmedString();
    });

    function toStatusSearch(): void {
      if (route.path !== '/status') router.push('/status');
    }

    function close(): void {
      clearSession();
      clearPeginStore();
      clearPegoutStore();
      router.push({ name: 'Home' });
    }

    return {
      image,
      networkNameTicker,
      networkTicker,
      amountUsd,
      amountValue,
      toStatusSearch,
      mdiCloseCircleOutline,
      close,
    };
  },
});
</script>
