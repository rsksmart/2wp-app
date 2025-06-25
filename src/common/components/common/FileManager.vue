<template>
  <div>
    <v-file-input
      v-model="fileInput"
      label="Select a file"
      prepend-icon="mdi-paperclip"
      :show-size="1024"
    ></v-file-input>

    <div v-if="fileInput">
      <p>Selected File: {{ fileInput.name }}</p>
      <p>Size: {{ (fileInput.size / 1024).toFixed(2) }} KB</p>
      <v-btn @click="handleFile">Guardar</v-btn>
    </div>
    <v-btn @click="retrieveFile">Abrir</v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useIndexedDB } from '@/common/composables/useIndexdedDB';

export default defineComponent({
  name: 'FileManager',
  setup() {
    const { saveFile, loadFile } = useIndexedDB();

    const fileInput = ref<File | null>(null);

    async function handleFile() {
      console.log('attempting to save file');
      const file = fileInput.value;
      if (file) {
        await saveFile(file.name, file);
        console.log('Archivo guardado en IndexedDB');
      }
    }

    async function retrieveFile() {
      const blob = await loadFile('Enero.pdf');
      if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url);
      } else {
        console.log('Archivo no encontrado');
      }
    }

    return {
      handleFile,
      retrieveFile,
      fileInput,
    };
  },
});
</script>
