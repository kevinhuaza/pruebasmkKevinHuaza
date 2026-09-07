import { describe, it, expect } from 'vitest';
import { buildCsvWithErrorColumn } from '../../src/utils/csv';

describe('utils/csv - buildCsvWithErrorColumn', () => {
  const csvText =
    'correo,nombre,telefono,ciudad,notas\n' +
    'no-es-email,Juan,abc,Madrid,\n' +
    'ana@example.com,Ana,612345678,Bogota,vip\n';

  it('agrega la columna "errores" al encabezado', () => {
    const result = buildCsvWithErrorColumn(csvText, []);
    const [header] = result.split('\n');
    expect(header).toBe('correo,nombre,telefono,ciudad,notas,errores');
  });

  it('rellena la columna de errores solo en las filas con problemas', () => {
    const details = [
      {
        row: 2,
        errors: [
          { field: 'correo', message: 'Formato de correo invalido: "no-es-email"' },
          { field: 'telefono', message: 'El telefono debe ser numerico y valido: "abc"' },
        ],
      },
    ];

    const result = buildCsvWithErrorColumn(csvText, details);
    const lines = result.trim().split('\n');

    expect(lines[1]).toContain('correo: Formato de correo invalido');
    expect(lines[1]).toContain('telefono: El telefono debe ser numerico y valido');
    expect(lines[2].endsWith(',')).toBe(true); // fila valida: columna errores vacia
  });

  it('no rompe cuando no hay errores en absoluto', () => {
    const validCsv = 'correo,nombre,telefono,ciudad\n' + 'a@a.com,A,123,Lima\n';
    const result = buildCsvWithErrorColumn(validCsv, []);
    expect(result).toContain('correo,nombre,telefono,ciudad,errores');
    expect(result).toContain('a@a.com,A,123,Lima,');
  });
});
