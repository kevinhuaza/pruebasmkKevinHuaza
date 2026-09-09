import { validateRow, validateHeaders } from '../../../src/validators/csvRow.validator';

describe('csvRow.validator - validateHeaders', () => {
  it('no reporta errores cuando estan todas las columnas requeridas', () => {
    const errors = validateHeaders(['correo', 'nombre', 'telefono', 'ciudad', 'notas']);
    expect(errors).toHaveLength(0);
  });

  it('reporta la columna obligatoria faltante', () => {
    const errors = validateHeaders(['correo', 'nombre', 'ciudad']);
    expect(errors).toContain('Falta la columna obligatoria "telefono" en el CSV');
  });

  it('reporta columnas no reconocidas', () => {
    const errors = validateHeaders(['correo', 'nombre', 'telefono', 'ciudad', 'campo_extra']);
    expect(errors.some((e) => e.includes('campo_extra'))).toBe(true);
  });

  it('es insensible a mayusculas/minusculas y espacios', () => {
    const errors = validateHeaders([' Correo ', 'NOMBRE', 'Telefono', 'ciudad']);
    expect(errors).toHaveLength(0);
  });
});

describe('csvRow.validator - validateRow', () => {
  const baseRow = {
    correo: 'juan@example.com',
    nombre: 'Juan Perez',
    telefono: '+34 612345678',
    ciudad: 'Madrid',
    notas: 'cliente vip',
  };

  it('acepta una fila completamente valida y la traduce a ingles', () => {
    const result = validateRow(baseRow, 2);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data).toEqual({
        email: 'juan@example.com',
        fullName: 'Juan Perez',
        phone: '+34 612345678',
        city: 'Madrid',
        notes: 'cliente vip',
      });
    }
  });

  it('permite que "notas" sea opcional (notes queda null si viene vacio)', () => {
    const result = validateRow({ ...baseRow, notas: '' }, 2);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.notes).toBeNull();
    }
  });

  it('rechaza un correo con formato invalido', () => {
    const result = validateRow({ ...baseRow, correo: 'no-es-un-correo' }, 3);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.row).toBe(3);
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'correo' }));
    }
  });

  it('rechaza un telefono no numerico', () => {
    const result = validateRow({ ...baseRow, telefono: 'abc123' }, 4);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual(expect.objectContaining({ field: 'telefono' }));
    }
  });

  it('acumula multiples errores en la misma fila', () => {
    const result = validateRow({ correo: '', nombre: '', telefono: '', ciudad: '' }, 5);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(4);
    }
  });

  it('rechaza cuando falta un campo obligatorio (ciudad)', () => {
    const result = validateRow({ ...baseRow, ciudad: '' }, 6);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'ciudad', message: 'La ciudad es obligatoria' })
      );
    }
  });
});
