<template>
  <div>
    <header class="app-header">
      <app-logo />
      <div class="user-badge">
        <span>{{ authStore.user?.nombre }}</span>
        <span class="role-pill">{{ authStore.user?.rol }}</span>
        <button class="btn btn-secondary btn-sm" @click="handleLogout">Salir</button>
      </div>
    </header>

    <main class="app-main">
      <alert-message type="error" :message="errorMessage" />
      <alert-message type="success" :message="successMessage" />

      <div class="template-hint">
        <span
          >¿No sabes que formato usar? El CSV debe tener las columnas
          <code>correo, nombre, telefono, ciudad, notas</code> (notas es opcional).</span
        >
        <button class="btn btn-secondary btn-sm" @click="handleDownloadTemplate">
          Descargar plantilla
        </button>
      </div>

      <file-drop-zone :uploading="uploading" @file-selected="handleFileSelected" />

      <documents-table
        :documents="documentsStore.documents"
        :is-admin="authStore.isAdmin"
        @download="handleDownload"
        @delete="handleDelete"
      />
    </main>

    <upload-result-modal
      :visible="uploadResult.visible"
      :status="uploadResult.status"
      :message="uploadResult.message"
      :details="uploadResult.details"
      :can-download="Boolean(uploadResult.errorCsvText)"
      @close="closeUploadModal"
      @download="downloadErrorCsv"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '../store/auth';
import { useDocumentsStore } from '../store/documents';
import AlertMessage from '../components/AlertMessage.vue';
import FileDropZone, { type FileSelectedPayload } from '../components/FileDropZone.vue';
import DocumentsTable from '../components/DocumentsTable.vue';
import UploadResultModal from '../components/UploadResultModal.vue';
import AppLogo from '../components/AppLogo.vue';
import { readFileAsText, buildCsvWithErrorColumn, downloadCsvText } from '../utils/csv';
import { getErrorMessage, getErrorDetails } from '../utils/errors';
import type { CsvDocument, CsvRowErrorDetail } from '../types';

interface UploadResultState {
  visible: boolean;
  status: 'success' | 'error';
  message: string;
  details: unknown[];
  errorCsvText: string | null;
  errorCsvFilename: string;
}

export default defineComponent({
  name: 'DashboardView',
  components: { AlertMessage, FileDropZone, DocumentsTable, UploadResultModal, AppLogo },
  data() {
    return {
      authStore: useAuthStore(),
      documentsStore: useDocumentsStore(),
      uploading: false,
      errorMessage: '',
      successMessage: '',
      uploadResult: {
        visible: false,
        status: 'success',
        message: '',
        details: [],
        errorCsvText: null,
        errorCsvFilename: '',
      } as UploadResultState,
    };
  },
  async mounted() {
    await this.loadDocuments();
  },
  methods: {
    async loadDocuments(): Promise<void> {
      try {
        await this.documentsStore.fetchDocuments();
      } catch (error) {
        this.errorMessage = getErrorMessage(error, 'No se pudieron cargar los documentos');
      }
    },
    async handleFileSelected({ file, error }: FileSelectedPayload): Promise<void> {
      this.clearMessages();

      if (error) {
        this.errorMessage = error;
        return;
      }
      if (!file) return;

      this.uploading = true;
      try {
        const document = await this.documentsStore.uploadDocument(file);
        this.uploadResult = {
          visible: true,
          status: 'success',
          message: `El archivo "${file.name}" se cargo correctamente con ${document.numRegistros} registro(s).`,
          details: [],
          errorCsvText: null,
          errorCsvFilename: '',
        };
      } catch (err) {
        const message = getErrorMessage(err, 'Error al procesar el archivo CSV');
        const details = getErrorDetails(err);
        const hasRowErrors = details.some(
          (item) => item && typeof (item as CsvRowErrorDetail).row === 'number'
        );

        let errorCsvText: string | null = null;
        if (hasRowErrors) {
          try {
            const originalText = await readFileAsText(file);
            errorCsvText = buildCsvWithErrorColumn(originalText, details as CsvRowErrorDetail[]);
          } catch (readError) {
            // El modal igual muestra el detalle de validacion, solo sin boton de descarga.
            console.warn('No se pudo releer el archivo original para anexar la columna de errores:', readError);
            errorCsvText = null;
          }
        }

        this.uploadResult = {
          visible: true,
          status: 'error',
          message,
          details,
          errorCsvText,
          errorCsvFilename: `errores_${file.name}`,
        };
      } finally {
        this.uploading = false;
      }
    },
    closeUploadModal(): void {
      this.uploadResult.visible = false;
    },
    downloadErrorCsv(): void {
      if (!this.uploadResult.errorCsvText) return;
      downloadCsvText(this.uploadResult.errorCsvText, this.uploadResult.errorCsvFilename);
    },
    async handleDownloadTemplate(): Promise<void> {
      this.clearMessages();
      try {
        await this.documentsStore.downloadTemplate();
      } catch (error) {
        this.errorMessage = getErrorMessage(error, 'No se pudo descargar la plantilla');
      }
    },
    async handleDownload(doc: CsvDocument): Promise<void> {
      this.clearMessages();
      try {
        await this.documentsStore.downloadDocument(doc);
      } catch (error) {
        this.errorMessage = 'No se pudo descargar el documento';
      }
    },
    async handleDelete(doc: CsvDocument): Promise<void> {
      this.clearMessages();
      if (!confirm(`Eliminar el documento "${doc.nombreOriginal}"? Esta accion no se puede deshacer.`)) {
        return;
      }
      try {
        await this.documentsStore.deleteDocument(doc.id);
        this.successMessage = 'Documento eliminado correctamente.';
      } catch (error) {
        this.errorMessage = getErrorMessage(error, 'No se pudo eliminar el documento');
      }
    },
    handleLogout(): void {
      this.authStore.logout();
      this.$router.push('/login');
    },
    clearMessages(): void {
      this.errorMessage = '';
      this.successMessage = '';
    },
  },
});
</script>
