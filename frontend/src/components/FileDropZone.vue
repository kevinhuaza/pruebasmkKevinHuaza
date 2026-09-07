<template>
  <div
    class="dropzone"
    :class="{ dragging: isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <div class="dropzone-icon">&#9729;</div>
    <p><strong>{{ uploading ? 'Subiendo archivo...' : 'Arrastra tu CSV aqui' }}</strong></p>
    <p v-if="!uploading">o haz clic para seleccionar un archivo</p>
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export interface FileSelectedPayload {
  file?: File;
  error?: string;
}

export default defineComponent({
  name: 'FileDropZone',
  props: {
    uploading: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    // Firma explicita (en vez de `Boolean` directo) para preservar el tipo
    // del payload en los listeners del padre (@file-selected="({file, error}) => ...").
    'file-selected': (payload: FileSelectedPayload): boolean => Boolean(payload), // NOSONAR: firma tipada intencional, ver comentario arriba
  },
  data() {
    return {
      isDragging: false,
    };
  },
  methods: {
    triggerFileInput(): void {
      (this.$refs.fileInput as HTMLInputElement).click();
    },
    handleDrop(event: DragEvent): void {
      this.isDragging = false;
      const file = event.dataTransfer?.files?.[0];
      this.emitFile(file);
    },
    handleFileSelect(event: Event): void {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      this.emitFile(file);
      target.value = '';
    },
    emitFile(file?: File): void {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.$emit('file-selected', { error: 'Solo se permiten archivos .csv' });
        return;
      }
      this.$emit('file-selected', { file });
    },
  },
});
</script>
