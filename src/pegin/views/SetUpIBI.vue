<template>
  <v-dialog :model-value="modelValue" persistent max-width="600"
    @update:model-value="onDialogClose">
    <v-card class="pa-6">
      <v-card-title class="text-h5 mb-4">
        Set Up IBI on Fireblocks
      </v-card-title>
      <v-form @submit.prevent="handleSubmit" class="my-10">
        <v-file-input
          v-model="selectedFile"
          :rules="fileRules"
          accept=".key"
          label="Select Key File"
          :prepend-icon="mdiFileUpload"
          variant="outlined"
          class="mb-4"
          :error-messages="fileError"
          @update:model-value="validateFile"
        />
        <v-text-field
          v-model="apiKey"
          :rules="apiKeyRules"
          label="API Key"
          variant="outlined"
          type="text"
          :prepend-icon="mdiKey"
          class="mb-6"
          :error-messages="apiKeyError"
          @update:model-value="validateApiKey"
        />
        <v-row no-gutters class="d-flex justify-end">
          <v-btn-rsk
            @click="handleSubmit"
            :disabled="!isFormValid || loading"
            class="text-body-1"
            :loading="loading"
            v-if="!successMessage"
          >
            <template #append>
              <v-icon :icon="mdiArrowRight" />
            </template>
            Submit Configuration
          </v-btn-rsk>
        </v-row>
      </v-form>
      <v-row class="d-flex justify-center">
        <span>
          {{ successMessage }}
        </span>
      </v-row>
      <v-row class="d-flex justify-end mr-4 mb-4">
        <v-btn-rsk v-if="successMessage" @click="closeDialog">
          Close
        </v-btn-rsk>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  defineComponent, ref,
  computed, watch,
} from 'vue';
import { mdiArrowRight, mdiFileUpload, mdiKey } from '@mdi/js';
import { useIndexedDB } from '@/common/composables/useIndexdedDB';

export default defineComponent({
  name: 'SetUpIbi',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue', 'close'],
  setup(props, { emit }) {
    const selectedFile = ref<File | null>(null);
    const apiKey = ref<string>('');
    const loading = ref<boolean>(false);
    const fileError = ref<string>('');
    const apiKeyError = ref<string>('');
    const successMessage = ref<string>('');
    const { saveFile, saveStringValue } = useIndexedDB();

    const fileRules = [
      (value: File | null) => {
        if (!value) return 'File is required';
        if (value.size > 10 * 1024 * 1024) return 'File size must be less than 10MB';
        return true;
      },
    ];

    const apiKeyRules = [
      (value: string) => {
        if (!value) return 'API Key is required';
        if (value.length < 10) return 'API Key must be at least 10 characters';
        return true;
      },
    ];

    const isFormValid = computed(() => selectedFile.value !== null
      && apiKey.value.length >= 10
      && fileError.value === ''
      && apiKeyError.value === '');

    function validateFile(files: File | File[] | null) {
      fileError.value = '';
      const file = Array.isArray(files) ? files[0] : files;
      if (!file) {
        fileError.value = 'File is required';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        fileError.value = 'File size must be less than 10MB';
      }
    }

    function validateApiKey(key: string) {
      apiKeyError.value = '';
      if (!key) {
        apiKeyError.value = 'API Key is required';
        return;
      }
      if (key.length < 10) {
        apiKeyError.value = 'API Key must be at least 10 characters';
      }
    }

    function handleSubmit() {
      if (!isFormValid.value || !selectedFile.value) return;
      loading.value = true;
      Promise.all([saveFile('secret.key', selectedFile.value), saveStringValue('apiKey', apiKey.value)])
        .then(() => {
          successMessage.value = 'Configuration submitted successfully';
        })
        .catch((error) => {
          console.error('Error submitting configuration:', error);
          successMessage.value = 'Error submitting configuration';
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function closeDialog() {
      emit('update:modelValue', false);
      emit('close');
    }

    function onDialogClose(val: boolean) {
      // Prevent closing unless form is submitted successfully
      if (!successMessage.value) {
        emit('update:modelValue', true);
      } else {
        emit('update:modelValue', val);
      }
    }

    // Prevent closing with ESC or outside click unless success
    watch(() => props.modelValue, (val) => {
      if (!val && !successMessage.value) {
        emit('update:modelValue', true);
      }
    });

    return {
      selectedFile,
      apiKey,
      loading,
      fileError,
      apiKeyError,
      fileRules,
      apiKeyRules,
      isFormValid,
      validateFile,
      validateApiKey,
      handleSubmit,
      mdiArrowRight,
      mdiFileUpload,
      mdiKey,
      successMessage,
      closeDialog,
      onDialogClose,
    };
  },
});
</script>

<style scoped>
.form {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
