import Papa from 'papaparse';
import type { CsvRowErrorDetail } from '../types';

export function readFileAsText(file: File): Promise<string> {
  return file.text();
}

/**
 * Reconstruye el CSV original agregando una columna "errores" con el detalle
 * de validacion de cada fila (vacia si la fila era valida).
 *
 * `rowErrorDetails` es el arreglo `details` que retorna el backend en un 422.
 */
export function buildCsvWithErrorColumn(
  csvText: string,
  rowErrorDetails: CsvRowErrorDetail[] = []
): string {
  const errorsByLine = new Map<number, string>();
  rowErrorDetails.forEach((item) => {
    if (item && typeof item.row === 'number' && Array.isArray(item.errors)) {
      const text = item.errors.map((e) => `${e.field}: ${e.message}`).join(' | ');
      errorsByLine.set(item.row, text);
    }
  });

  const parsed = Papa.parse<string[]>(csvText.trim(), { skipEmptyLines: true });
  const rows = parsed.data;
  if (rows.length === 0) {
    return csvText;
  }

  const header = [...rows[0], 'errores'];
  const dataRows = rows.slice(1).map((row, index) => {
    const lineNumber = index + 2; // fila 1 = encabezado, datos empiezan en 2
    return [...row, errorsByLine.get(lineNumber) || ''];
  });

  return Papa.unparse([header, ...dataRows], { newline: '\n' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function downloadCsvText(csvText: string, filename: string): void {
  downloadBlob(new Blob([csvText], { type: 'text/csv;charset=utf-8;' }), filename);
}
