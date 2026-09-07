<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div :class="['modal-icon', status === 'success' ? 'modal-icon-success' : 'modal-icon-error']">
          {{ status === 'success' ? '✓' : '✕' }}
        </div>
        <h3>{{ status === 'success' ? 'Carga completada' : 'La carga fallo' }}</h3>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>

        <ul v-if="rowErrors.length" class="modal-error-list">
          <li v-for="item in rowErrors" :key="item.row" class="modal-error-item">
            <strong>Fila {{ item.row }}:</strong>
            <ul>
              <li v-for="(err, i) in item.errors" :key="i">{{ err.field }} - {{ err.message }}</li>
            </ul>
          </li>
        </ul>

        <ul v-else-if="genericErrors.length" class="modal-error-list">
          <li v-for="(err, i) in genericErrors" :key="i" class="modal-error-item">{{ err }}</li>
        </ul>
      </div>

      <div class="modal-footer">
        <button
          v-if="status === 'error' && canDownload"
          class="btn btn-secondary"
          @click="$emit('download')"
        >
          Descargar CSV con errores
        </button>
        <button class="btn" @click="$emit('close')">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { CsvRowErrorDetail } from '../types';

type UploadStatus = 'success' | 'error';
type DetailItem = CsvRowErrorDetail | string | Record<string, unknown>;

export default defineComponent({
  name: 'UploadResultModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String as PropType<UploadStatus>,
      default: 'success',
    },
    message: {
      type: String,
      default: '',
    },
    details: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    canDownload: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'download'],
  computed: {
    rowErrors(): CsvRowErrorDetail[] {
      return (this.details as DetailItem[]).filter(
        (item): item is CsvRowErrorDetail =>
          typeof item === 'object' && item !== null && typeof (item as CsvRowErrorDetail).row === 'number'
      );
    },
    genericErrors(): string[] {
      if (this.rowErrors.length > 0) return [];
      return (this.details as DetailItem[]).map((item) =>
        typeof item === 'string' ? item : JSON.stringify(item)
      );
    },
  },
});
</script>
