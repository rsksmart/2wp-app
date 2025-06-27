<template>
  <v-container class="form">
    <v-row no-gutters class="d-flex justify-center">
      <v-col cols="6" class="d-flex space-between flex-column">
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
              prepend-icon="mdi-file-upload"
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
              type="password"
              prepend-icon="mdi-key"
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
              >
                <template #append>
                  <v-icon :icon="mdiArrowRight" />
                </template>
                Submit Configuration
              </v-btn-rsk>
            </v-row>
          </v-form>
          <v-row class="d-flex justify-center mt-6 mb-6">
            <span>
              {{ successMessage }}
            </span>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { mdiArrowRight } from '@mdi/js';
import { useIndexedDB } from '@/common/composables/useIndexdedDB';

export default defineComponent({
  name: 'SetUpIBI',
  setup() {
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
      successMessage,
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
