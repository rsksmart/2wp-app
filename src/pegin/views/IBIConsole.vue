<template>
  <v-container class="pt-10">
    <v-btn @click="getVaults">Get Vaults</v-btn>
    <v-btn @click="sendTransaction">Send Transaction</v-btn>
    <v-list class="mt-10">
      <v-list-item v-for="vault in vaults" :key="vault.id">
        {{ vault.name }} - BTC: {{ vault.assets.length ? vault.assets[0].total : 0 }}
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { VaultAccount } from '@/common/types';
import { defineComponent, ref } from 'vue';
import { useIndexedDB } from '@/common/composables/useIndexdedDB';
import { readFileAsText } from '@/common/utils';
import { FireblocksService } from '../services';

export default defineComponent({
  name: 'IBIConsole',
  setup() {
    const { loadStringValue, loadFile } = useIndexedDB();
    let fireblocksService: FireblocksService = new FireblocksService('a', 'b');
    const vaults = ref<VaultAccount[]>([]);

    async function getVaults() {
      const res = await fireblocksService.getVaultAccounts();
      console.log(res);
      vaults.value = res;
    }

    async function sendTransaction() {
      const fvaults = await fireblocksService.getVaultAccounts();
      console.log(fvaults);
    }

    async function setupService() {
      const apiKey = await loadStringValue('apiKey');
      const keyBlob = await loadFile('secret.key');
      if (!keyBlob || !apiKey) {
        throw new Error('Key file not found in IndexedDB');
      }
      const file = new File([keyBlob], 'secret.key', {
        type: keyBlob.type,
        lastModified: Date.now(),
      });
      const key = await readFileAsText(file);
      fireblocksService = new FireblocksService(apiKey, key);
      console.log('Fireblocks service setup complete');
    }

    setupService();

    return {
      vaults,
      getVaults,
      sendTransaction,
    };
  },
});
</script>
