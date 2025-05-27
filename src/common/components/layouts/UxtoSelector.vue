<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-dialog v-model="show" width="850" min-height="600" persistent class="pa-5">
    <v-card rounded="rounded-lg" min-height="600" class="container pa-10">
      <v-row class="mx-0 mt-7 mb-0 d-flex justify-start">
        <v-col cols="3" class="ma-0 pa-0"><h2 class="text-h5 font-bold">UTXO List</h2></v-col>
        <v-col class="ma-0 pa-0">
            <v-chip v-show="selectedAccount"
            variant="flat" :color="getAccountChip().color" density="compact">
            {{ getAccountChip().text }}
          </v-chip>
        </v-col>
      </v-row>
      <v-row class="mx-0 mb-2 d-flex justify-start">
        <span>
          Select the UTXOs you want to use for the transaction.
        </span>
      </v-row>
      <v-row>
        <v-data-table
          :headers="headers"
          :items="utxoList[getAccountName(selectedAccount)]"
          item-value="txid"
          class="elevation-1"
          hide-default-footer
        >
        <template #headers="{ columns }">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key ?? column.title"
              scope="col"
              class="text-left text-subtitle-2 font-weight-medium"
            >
              {{ column.title }}
            </th>
          </tr>
        </template>
          <template #item.selected="{ item }">
            <v-checkbox
              v-model="localSelection[getAccountName(selectedAccount)][item.txid]"
              @change="onCheckboxChange(item.txid)"
              hide-details
              density="compact"
            />
          </template>
          <template #item.address="{ item }">
            <span class="text-body-1">
              {{ truncateStringToSize(item.address ?? '', 15) }}
            </span>
          </template>
          <template #item.txid="{ item }">
            <span class="text-body-1">
              {{ truncateStringToSize(item.txid, 15) }}
            </span>
          </template>
          <template #item.amount="{ item }">
            <span class="text-body-1">
              {{ toBtcString(item.amount) }}
            </span>
          </template>
          <template #item.vout="{ item }">
            <span class="text-body-1">
              {{ item.vout }}
            </span>
          </template>
          <template #bottom>
            <v-data-table-footer
            :page="page"
            :items-per-page="ITEMS_PER_PAGE"
            :items-length="utxoList[getAccountName(selectedAccount)].length"
            @update:page="page = $event"
            class="justify-end"
            :show-first-last-page="false"
            :items-per-page-options="[ITEMS_PER_PAGE]"
            :class="'text-body-1'"
          />
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
import {
  BtcAccount, SatoshiBig, Utxo, UtxoListPerAccount,
} from '@/common/types';
import * as constants from '@/common/store/constants';
import { truncateStringToSize } from '@/common/utils';
import EnvironmentContextProviderService from '@/common/providers/EnvironmentContextProvider';

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
    const environmentContext = EnvironmentContextProviderService.getEnvironmentContext();
    const localSelection = reactive<{
      legacy: Record<string, boolean>;
      segwit: Record<string, boolean>;
      nativeSegwit: Record<string, boolean>;
    }>({
      legacy: {},
      segwit: {},
      nativeSegwit: {},
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

    const headers = [
      {
        title: 'Select', value: 'selected', sortable: false, width: '14',
      },
      {
        title: 'Address',
        key: 'address',
        value: (item: Utxo) => {
          const account = getAccountName(selectedAccount.value);
          return item[account as keyof Utxo];
        },
      },
      {
        title: 'Transaction ID',
        key: 'txid',
      },
      { title: `Value (${environmentContext.getBtcTicker()})`, key: 'amount' },
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

    const page = ref(1);
    const ITEMS_PER_PAGE = 15;
    const pageCount = computed(() => Math
      .ceil(utxoList.value[getAccountName(selectedAccount.value)].length / ITEMS_PER_PAGE));

    function getAccountChip() {
      switch (selectedAccount.value) {
        case BtcAccount.BITCOIN_LEGACY_ADDRESS:
          return { text: 'Legacy', color: 'pink' };
        case BtcAccount.BITCOIN_SEGWIT_ADDRESS:
          return { text: 'Segwit', color: 'orange' };
        case BtcAccount.BITCOIN_NATIVE_SEGWIT_ADDRESS:
          return { text: 'Native Segwit', color: 'teal' };
        default:
          return { text: '', color: '' };
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

    function toBtcString(sats: number): string {
      return new SatoshiBig(sats, 'satoshi').toBTCTrimmedString();
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
      getAccountChip,
      truncateStringToSize,
      page,
      pageCount,
      ITEMS_PER_PAGE,
      toBtcString,
    };
  },
});
</script>
