<template>
  <div v-if="message || (details && details.length)" :class="['alert', `alert-${type}`]">
    <div>{{ message }}</div>
    <ul v-if="details && details.length">
      <li v-for="(item, index) in formattedDetails" :key="index">{{ item }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface FieldError {
  field?: string;
  message?: string;
}

interface RowError {
  row?: number;
  errors?: FieldError[];
}

type AlertDetail = string | FieldError | RowError | Record<string, unknown>;

export default defineComponent({
  name: 'AlertMessage',
  props: {
    type: {
      type: String,
      default: 'error',
    },
    message: {
      type: String,
      default: '',
    },
    details: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
  },
  computed: {
    formattedDetails(): string[] {
      return (this.details as AlertDetail[]).map((item) => {
        if (typeof item === 'string') return item;
        const fieldError = item as FieldError;
        if (fieldError.field && fieldError.message) return `${fieldError.field}: ${fieldError.message}`;
        const rowError = item as RowError;
        if (rowError.row && rowError.errors) {
          const fieldErrors = rowError.errors.map((e) => `${e.field} - ${e.message}`).join('; ');
          return `Fila ${rowError.row}: ${fieldErrors}`;
        }
        return JSON.stringify(item);
      });
    },
  },
});
</script>
