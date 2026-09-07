import { defineStore } from 'pinia';
import apiClient from '../api/axios';
import { downloadBlob } from '../utils/csv';
import type { CsvDocument } from '../types';

const TEMPLATE_FILENAME = 'plantilla-clientes.csv';

interface DocumentsState {
  documents: CsvDocument[];
  loading: boolean;
}

export const useDocumentsStore = defineStore('documents', {
  state: (): DocumentsState => ({
    documents: [],
    loading: false,
  }),

  actions: {
    async fetchDocuments(): Promise<void> {
      this.loading = true;
      try {
        const { data } = await apiClient.get('/documents');
        this.documents = data.data as CsvDocument[];
      } finally {
        this.loading = false;
      }
    },

    async uploadDocument(file: File): Promise<CsvDocument> {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const document = data.data as CsvDocument;
      this.documents.unshift(document);
      return document;
    },

    async downloadDocument(doc: CsvDocument): Promise<void> {
      const response = await apiClient.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      });
      downloadBlob(new Blob([response.data]), doc.nombreOriginal);
    },

    async downloadTemplate(): Promise<void> {
      const response = await apiClient.get('/documents/template', {
        responseType: 'blob',
      });
      downloadBlob(new Blob([response.data]), TEMPLATE_FILENAME);
    },

    async deleteDocument(id: number): Promise<void> {
      await apiClient.delete(`/documents/${id}`);
      this.documents = this.documents.filter((doc) => doc.id !== id);
    },
  },
});
