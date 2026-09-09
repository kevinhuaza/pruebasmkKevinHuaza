import { parseAndValidateCsv } from '../../../src/services/csv.service';
import ApiError from '../../../src/utils/ApiError';

function toBuffer(content: string): Buffer {
  return Buffer.from(content, 'utf-8');
}

describe('csv.service - parseAndValidateCsv', () => {
  it('retorna las filas validas cuando el CSV es correcto', () => {
    const rows = parseAndValidateCsv(
      toBuffer(
        'correo,nombre,telefono,ciudad,notas\n' +
          'juan@example.com,Juan Perez,612345678,Madrid,vip\n' +
          'ana@example.com,Ana Lopez,0987654321,Bogota,\n'
      )
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      email: 'juan@example.com',
      fullName: 'Juan Perez',
      phone: '612345678',
      city: 'Madrid',
      notes: 'vip',
    });
    expect(rows[1].notes).toBeNull();
  });

  it.each([
    ['faltan columnas obligatorias', 'correo,nombre,ciudad\njuan@example.com,Juan,Madrid\n'],
    ['el archivo no tiene registros', 'correo,nombre,telefono,ciudad,notas\n'],
    ['el archivo esta mal formado', 'correo,nombre,telefono,ciudad\n"sin comilla de cierre'],
  ])('lanza 422 cuando %s', (_description, csvContent) => {
    expect(() => parseAndValidateCsv(toBuffer(csvContent))).toThrow(
      expect.objectContaining({ statusCode: 422 })
    );
  });

  it('lanza 422 con el detalle de las filas invalidas', () => {
    const buffer = toBuffer('correo,nombre,telefono,ciudad,notas\n' + 'no-es-email,Juan,abc,Madrid,\n');

    try {
      parseAndValidateCsv(buffer);
      throw new Error('Se esperaba que la funcion lanzara un error');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.statusCode).toBe(422);
      const details = apiError.details as Array<{ row: number; errors: unknown[] }>;
      expect(details).toHaveLength(1);
      expect(details[0].row).toBe(2);
      expect(details[0].errors.length).toBeGreaterThanOrEqual(2);
    }
  });
});
