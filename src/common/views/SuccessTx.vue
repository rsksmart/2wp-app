<template>
  <v-container fluid>
    <v-row no-gutters justify="center">
      <v-col md="5" lg="4" xl="3" xxl="2">
        <v-row no-gutters>
          <div class="text-h1 mb-2 pa-4 bg-teal">You are</div>
        </v-row>
        <v-row no-gutters>
          <div class="text-h1 pa-4 bg-yellow">Done!</div>
        </v-row>
        <v-row no-gutters>
          <div class="pt-4">
            <span>
              You will receive 0.0000005 TRBTC on your
              <br>
            </span>
            <span>address within the next 5-10 minutes.</span>
          </div>
        </v-row>
      </v-col>
      <v-col md="5" lg="4" xl="3" xxl="2">
        <v-row no-gutters>
          <span class="subheading">
            Transaction ID
          </span>
        </v-row>
        <v-row no-gutters class="mb-4">
          <v-text-field
            density="comfortable"
            variant="outlined"
            readonly
          >
            <template #append-inner >
              <v-icon size="x-small" :icon="mdiContentCopy" />
            </template>
          </v-text-field>
        </v-row>
        <v-row no-gutters class="my-4">
          <v-btn-rsk block>See Transaction</v-btn-rsk>
        </v-row>
        <v-row no-gutters>
          <v-btn-rsk block @click="goHome">Start Again</v-btn-rsk>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { mdiContentCopy } from '@mdi/js';
import { defineComponent } from 'vue';
import { useAction } from '@/common/store/helper';
import * as constants from '@/common/store/constants';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'SuccessTx',
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup() {
    const clearStatus = useAction('status', constants.STATUS_CLEAR);
    const router = useRouter();

    function goHome() {
      clearStatus();
      router.push({ name: 'Home' });
    }

    return {
      mdiContentCopy,
      goHome,
    };
  },
});
</script>
