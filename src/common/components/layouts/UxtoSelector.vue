<template>
  <v-dialog v-model="show" width="850" persistent class="pa-5">
    <v-card class="container dialog pa-6">
      <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
        <h2 class="text-xl font-bold mb-4">UTXO Selector</h2>
      </v-row>
      <v-tabs
        v-model="tab"
      >
        <v-tab value="legacy">Legacy (P2PKH)</v-tab>
        <v-tab value="segwit">Segwit (P2SH)</v-tab>
        <v-tab value="bech32">Native Segwit (Bech32)</v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="legacy">
            <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="utxoList.legacy"
                item-value="txid"
                show-select
                class="elevation-1"
                hide-default-footer
                disable-sort
                items-per-page="20"
              >
              </v-data-table>
            </v-row>
          </v-tabs-window-item>

          <v-tabs-window-item value="segwit">
            <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="utxoList.segwit"
                item-value="txid"
                show-select
                class="elevation-1"
                hide-default-footer
                disable-sort
                items-per-page="20"
              >
              </v-data-table>
            </v-row>
          </v-tabs-window-item>

          <v-tabs-window-item value="bech32">
            <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
              <v-data-table
                v-model="selected"
                :headers="headers"
                :items="utxoList.nativeSegwit"
                item-value="txid"
                show-select
                class="elevation-1"
                hide-default-footer
                disable-sort
                items-per-page="20"
              >
              </v-data-table>
            </v-row>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
      <v-row>
        {{ selected }}
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, ref, watch,
} from 'vue';
import { useStateAttribute } from '@/common/store/helper';
import { UtxoListPerAccount } from '@/common/types';

export default defineComponent({
  name: 'UxtoSelector',
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const utxoList = useStateAttribute<UtxoListPerAccount>('pegInTx', 'utxoList');
    const headers = [
      {
        title: 'Transaction ID',
        key: 'txid',
      },
      { title: 'Value (Sats)', key: 'amount' },
      { title: 'Index', key: 'vout' },
    ];
    const selected = ref([]);
    const tab = ref('legacy');

    const show = computed({
      get() {
        return props.showDialog;
      },
      set(value) {
        context.emit('update:showDialog', value);
      },
    });

    function updateSelected() {
      console.log('Toggling selection for UTXO:', selected.value);
    }
    watch(selected, updateSelected);

    return {
      utxoList,
      show,
      headers,
      selected,
      tab,
    };
  },
});
</script>
