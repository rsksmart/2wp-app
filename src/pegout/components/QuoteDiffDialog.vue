<template>
    <v-dialog v-model="showWarningMessage" width="870" persistent>
      <v-card class="container dialog">
        <v-row class="mx-0 mt-7 mb-2 d-flex justify-center">
          <h2>Option Update</h2>
        </v-row>
        <v-col cols="12" align-self="center" class="pt-0">
          <v-row class="ma-0 d-flex justify-center">
            <v-icon class="ml-2" color="#000000" :icon="mdiAlertOutline" size="80"></v-icon>
          </v-row>
          <v-col offset="1" cols="10">
            <p class="justify-center">
              Some options have been updated. Please review the changes before continuing.
            </p>
            <v-table density="compact">
                <thead>
                <tr>
                    <th class="text-left">
                    Field
                    </th>
                    <th class="text-left">
                    Old Value
                    </th>
                    <th class="text-left">
                    New Value
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr
                v-for="(field, idx) in differences" :key="`diff-${idx}`"
                >
                    <td>{{ field.key }}</td>
                    <td>{{ field.oldValue }}</td>
                    <td>{{ field.newValue }}</td>
                </tr>
                </tbody>
            </v-table>
          </v-col>
          <v-row class="mx-0 mb-8 mt-3" justify="space-around">
            <v-col class="d-flex justify-center">
              <v-btn width="100" height="40" dense outlined rounded color="#000000" @click="send">
                <span class="whiteish">continue</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>
  </template>

<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { mdiAlertOutline } from '@mdi/js';
import { ObjectDifference } from '@/common/types';

export default defineComponent({
  name: 'QuoteDiffDialog',
  props: {
    differences: {
      type: Array<ObjectDifference>,
      required: true,
    },
    showDialog: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showWarningMessage = toRef(props, 'showDialog');

    const send = () => {
      showWarningMessage.value = false;
      emit('continue');
    };

    return {
      send,
      showWarningMessage,
      mdiAlertOutline,
    };
  },
});
</script>
