import { parse } from 'csv-parse/sync';
import ApiError from '../utils/ApiError';
import { validateRow, validateHeaders, CsvValidRow, CsvRawRow } from '../validators/csvRow.validator';

export function parseAndValidateCsv(fileBuffer: Buffer): CsvValidRow[] {
  const rawContent = fileBuffer.toString('utf-8');

  let records: CsvRawRow[];
  try {
    records = parse(rawContent, {
      columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw ApiError.unprocessable('El archivo CSV esta mal formado y no pudo ser leido', [message]);
  }

  if (records.length === 0) {
    throw ApiError.unprocessable('El archivo CSV no contiene registros');
  }

  const headerErrors = validateHeaders(Object.keys(records[0]));
  if (headerErrors.length > 0) {
    throw ApiError.unprocessable('La estructura del CSV es invalida', headerErrors);
  }

  const validRows: CsvValidRow[] = [];
  const rowErrors: unknown[] = [];

  records.forEach((row, index) => {
    const rowNumber = index + 2; // +2: header row + 1-indexed
    const result = validateRow(row, rowNumber);
    if (result.valid) {
      validRows.push(result.data);
    } else {
      rowErrors.push(result);
    }
  });

  if (rowErrors.length > 0) {
    throw ApiError.unprocessable(
      `Se encontraron ${rowErrors.length} fila(s) con errores de validacion`,
      rowErrors
    );
  }

  return validRows;
}
