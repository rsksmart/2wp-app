<!-- eslint-disable vue/valid-v-slot -->
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
        <v-tab value="nativeSegwit">Native Segwit (Bech32)</v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="legacy">
            <v-row>
              <v-data-table
                :headers="headers"
                :items="utxoList.legacy"
                item-value="txid"
                class="elevation-1"
              >
                <template #item.selected="{ item }">
                  <v-checkbox
                    v-model="localSelection.legacy[item.txid]"
                    @change="onCheckboxChange(item.txid)"
                    hide-details
                    density="compact"
                  />
                </template>

                <template #item.value="{ item }">
                  {{ item.amount }} sats
                </template>
              </v-data-table>
            </v-row>
          </v-tabs-window-item>

          <v-tabs-window-item value="segwit">
            <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
              <v-data-table
                :headers="headers"
                :items="utxoList.segwit"
                item-value="txid"
                class="elevation-1"
              >
                <template #item.selected="{ item }">
                  <v-checkbox
                    v-model="localSelection.segwit[item.txid]"
                    @change="onCheckboxChange(item.txid)"
                    hide-details
                    density="compact"
                  />
                </template>

                <template #item.value="{ item }">
                  {{ item.amount }} sats
                </template>
              </v-data-table>
            </v-row>
          </v-tabs-window-item>

          <v-tabs-window-item value="nativeSegwit">
            <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
              <v-data-table
                :headers="headers"
                :items="utxoList.nativeSegwit"
                item-value="txid"
                class="elevation-1"
              >
                <template #item.selected="{ item }">
                  <v-checkbox
                    v-model="localSelection.nativeSegwit[item.txid]"
                    @change="onCheckboxChange(item.txid)"
                    hide-details
                    density="compact"
                  />
                </template>

                <template #item.value="{ item }">
                  {{ item.amount }} sats
                </template>
              </v-data-table>
            </v-row>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
      <v-row class="mx-0 mb-8 mt-3" justify="space-around">
        <v-col class="d-flex justify-center">
          <v-btn width="100" height="40" dense outlined rounded @click="continueToApp">
            <span>Continue</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  computed, defineComponent, reactive, ref, watch,
} from 'vue';
import { useAction, useStateAttribute } from '@/common/store/helper';
import { Utxo, UtxoListPerAccount } from '@/common/types';
import * as constants from '@/common/store/constants';

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
    const toggleSelection = useAction('pegInTx', constants.PEGIN_TX_TOGGLE_SELECTED_UTXO);
    const localSelection = reactive<{
      legacy: Record<string, boolean>;
      segwit: Record<string, boolean>;
      nativeSegwit: Record<string, boolean>;
    }>({
      legacy: {},
      segwit: {},
      nativeSegwit: {},
    });
    const headers = [
      { title: 'Select', value: 'selected', sortable: false },
      {
        title: 'Transaction ID',
        key: 'txid',
      },
      { title: 'Value (Sats)', key: 'amount' },
      { title: 'Index', key: 'vout' },
    ];
    const selected = ref([]);
    const tab = ref<keyof UtxoListPerAccount>('legacy');

    const show = computed({
      get() {
        return props.showDialog;
      },
      set(value) {
        context.emit('update:showDialog', value);
      },
    });

    function onCheckboxChange(hash: string) {
      toggleSelection({ txId: hash, selected: localSelection[tab.value][hash] });
    }

    function continueToApp() {
      context.emit('update:showDialog', false);
    }

    watch(
      utxoList,
      (utxos) => {
        if (!utxos) return;
        ['legacy', 'segwit', 'nativeSegwit'].forEach((type) => {
          const group = utxos[type as keyof typeof utxos];
          if (group) {
            group.forEach((utxo: Utxo) => {
              localSelection[type as keyof typeof localSelection][utxo.txid] = utxo.selected;
            });
          }
        });
      },
      { immediate: true, deep: true },
    );

    return {
      utxoList,
      show,
      headers,
      selected,
      tab,
      localSelection,
      onCheckboxChange,
      continueToApp,
    };
  },
});
</script>
