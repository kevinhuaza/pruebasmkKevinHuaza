const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/;
const PHONE_REGEX = /^\+?\d[\d\s-]{6,14}$/;

const REQUIRED_COLUMNS = ['correo', 'nombre', 'telefono', 'ciudad'];
const ALLOWED_COLUMNS = new Set(['correo', 'nombre', 'telefono', 'ciudad', 'notas']);

export interface CsvRawRow {
  [key: string]: string | undefined;
}

export interface CsvValidRow {
  email: string;
  fullName: string;
  phone: string;
  city: string;
  notes: string | null;
}

export interface CsvFieldError {
  field: string;
  message: string;
}

export type CsvRowValidationResult =
  | { valid: true; data: CsvValidRow }
  | { valid: false; row: number; errors: CsvFieldError[] };

export function validateHeaders(columns: string[]): string[] {
  const errors: string[] = [];
  const normalized = columns.map((c) => c.trim().toLowerCase());

  REQUIRED_COLUMNS.forEach((required) => {
    if (!normalized.includes(required)) {
      errors.push(`Falta la columna obligatoria "${required}" en el CSV`);
    }
  });

  normalized.forEach((col) => {
    if (!ALLOWED_COLUMNS.has(col)) {
      errors.push(`La columna "${col}" no es reconocida`);
    }
  });

  return errors;
}

export function validateRow(row: CsvRawRow, rowNumber: number): CsvRowValidationResult {
  const fieldErrors: CsvFieldError[] = [];

  const correo = (row.correo || '').trim();
  const nombre = (row.nombre || '').trim();
  const telefono = (row.telefono || '').trim();
  const ciudad = (row.ciudad || '').trim();
  const notas = (row.notas || '').trim();

  if (!correo) {
    fieldErrors.push({ field: 'correo', message: 'El correo es obligatorio' });
  } else if (!EMAIL_REGEX.test(correo)) {
    fieldErrors.push({ field: 'correo', message: `Formato de correo invalido: "${correo}"` });
  }

  if (!nombre) {
    fieldErrors.push({ field: 'nombre', message: 'El nombre es obligatorio' });
  }

  if (!telefono) {
    fieldErrors.push({ field: 'telefono', message: 'El telefono es obligatorio' });
  } else if (!PHONE_REGEX.test(telefono)) {
    fieldErrors.push({
      field: 'telefono',
      message: `El telefono debe ser numerico y valido: "${telefono}"`,
    });
  }

  if (!ciudad) {
    fieldErrors.push({ field: 'ciudad', message: 'La ciudad es obligatoria' });
  }

  if (fieldErrors.length > 0) {
    return { valid: false, row: rowNumber, errors: fieldErrors };
  }

  return {
    valid: true,
    data: {
      email: correo,
      fullName: nombre,
      phone: telefono,
      city: ciudad,
      notes: notas || null,
    },
  };
}
