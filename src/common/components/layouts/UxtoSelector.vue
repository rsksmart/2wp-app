<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-dialog v-model="show" width="850" persistent class="pa-5">
    <v-card class="container dialog pa-6">
      <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
        <h2 class="text-xl font-bold mb-4">UTXO Selector</h2>
      </v-row>
      <v-row>
        <v-data-table
          :headers="headers"
          :items="utxoList[getAccountName(selectedAccount)]"
          item-value="txid"
          class="elevation-1"
        >
          <template #item.selected="{ item }">
            <v-checkbox
              v-model="localSelection[getAccountName(selectedAccount)][item.txid]"
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
import { BtcAccount, Utxo, UtxoListPerAccount } from '@/common/types';
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
    const selectedAccount = useStateAttribute<BtcAccount>('pegInTx', 'selectedAccount');
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

    const show = computed({
      get() {
        return props.showDialog;
      },
      set(value) {
        context.emit('update:showDialog', value);
      },
    });

    function getAccountName(account: BtcAccount): keyof typeof localSelection {
      switch (account) {
        case BtcAccount.BITCOIN_LEGACY_ADDRESS:
          return 'legacy';
        case BtcAccount.BITCOIN_SEGWIT_ADDRESS:
          return 'segwit';
        case BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS:
          return 'nativeSegwit';
        default:
          return 'legacy';
      }
    }

    function onCheckboxChange(hash: string) {
      toggleSelection(
        {
          txId: hash,
          selected: localSelection[getAccountName(selectedAccount.value)][hash],
        },
      );
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
      localSelection,
      onCheckboxChange,
      continueToApp,
      selectedAccount,
      getAccountName,
    };
  },
});
</script>
