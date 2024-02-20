<template>
    <div class="form-step ma-0 pt-4">
    <v-row class="align-start mx-0">
    <v-col cols="auto" class="pl-0">
        <div v-bind:class="[focus ?
            'number-filled' : 'number']">3</div>
    </v-col>
    <v-col class="px-0 pb-1">
        <p v-bind:class="{'boldie': focus}">
          Inform your destination address:
        </p>
        <v-row class="d-flex align-center ma-0 mt-4 pl-1">
        <v-col cols="6" :class="[stepState !== 'error' ?
                    'black-box' : 'yellow-box']"
                    class="ma-0 pa-0 input-box-outline" >
            <v-text-field
                v-model="btcAddress"
                flat
                hide-details
                single-line
                persistent-placeholder
                density="compact"
                variant="solo"
                @focus="focus = true"
                @blur="focus = false"
                :placeholder="`Paste your ${environmentContext.getBtcTicker()} address`"
                @update:model-value="updateStore"/>
        </v-col>
        </v-row>
        <v-row class="ma-0 pt-1 error-max-balance" style="min-height: 17px;">
        <span v-if="stepState === 'error'" class="yellowish" id="rbtc-error-msg">
            {{errorMessage}}
        </span>
        </v-row>
    </v-col>
    </v-row>
</div>
</template>
<script lang="ts">
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';
import { validateAddress } from '@/common/utils';
import * as constants from '@/common/store/constants';
import { computed, defineComponent, ref } from 'vue';
import { useAction } from '@/common/store/helper';

export default defineComponent({
  name: 'BtcRecipientInput',
  setup(_, context) {
    const btcAddress = ref('');
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const focus = ref(false);
    const stepState = ref<'unset' | 'valid' |'error'>('unset');

    const setBtcAddress = useAction('flyoverPegout', constants.FLYOVER_PEGOUT_ADD_BTC_ADDRESS);

    const isValidBtcAddress = computed(() => {
      const { valid, addressType } = validateAddress(btcAddress.value);
      return valid && addressType === constants.BITCOIN_LEGACY_ADDRESS;
    });

    const errorMessage = computed(() => 'The address is not a valid legacy (p2pkh) address');

    const updateStore = () => {
      setBtcAddress(btcAddress.value);
      if (isValidBtcAddress.value) {
        stepState.value = 'valid';
        context.emit('valid-btc-address', true);
      } else {
        stepState.value = 'error';
        context.emit('valid-btc-address', false);
      }
    };

    return {
      btcAddress,
      environmentContext,
      isValidBtcAddress,
      updateStore,
      focus,
      stepState,
      errorMessage,
    };
  },
});
</script>
