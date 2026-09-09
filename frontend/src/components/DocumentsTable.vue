<template>
  <div class="table-wrapper">
    <div v-if="documents.length === 0" class="empty-state">
      Aun no se han cargado documentos.
    </div>
    <table v-else>
      <thead>
        <tr>
          <th>Nombre del documento</th>
          <th>Usuario</th>
          <th>Fecha de carga</th>
          <th>N&deg; registros</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documents" :key="doc.id">
          <td>{{ doc.originalName }}</td>
          <td>{{ doc.uploadedBy?.username }}</td>
          <td>{{ formatDate(doc.uploadedAt) }}</td>
          <td>{{ doc.recordCount }}</td>
          <td class="actions-cell">
            <button class="btn btn-secondary btn-sm" @click="$emit('download', doc)">
              Descargar
            </button>
            <button
              v-if="isAdmin"
              class="btn btn-danger btn-sm"
              @click="$emit('delete', doc)"
            >
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { CsvDocument } from '../types';

export default defineComponent({
  name: 'DocumentsTable',
  props: {
    documents: {
      type: Array as PropType<CsvDocument[]>,
      default: () => [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    // Firma explicita (en vez de `Boolean` directo) para preservar el tipo
    // del payload en los listeners del padre (@download="doc => ...").
    download: (doc: CsvDocument): boolean => Boolean(doc), // NOSONAR: firma tipada intencional, ver comentario arriba
    delete: (doc: CsvDocument): boolean => Boolean(doc), // NOSONAR: firma tipada intencional, ver comentario arriba
  },
  methods: {
    formatDate(value?: string): string {
      if (!value) return '-';
      return new Date(value).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
});
</script>
