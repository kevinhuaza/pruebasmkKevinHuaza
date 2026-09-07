import ApiError from '../../../src/utils/ApiError';

describe('ApiError', () => {
  it('crea un error generico con el statusCode indicado', () => {
    const error = new ApiError(418, 'Soy una tetera');
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe('Soy una tetera');
    expect(error.isOperational).toBe(true);
  });

  it('badRequest retorna un error 400 con detalles opcionales', () => {
    const error = ApiError.badRequest('Datos invalidos', [{ field: 'nombre' }]);
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual([{ field: 'nombre' }]);
  });

  it.each([
    ['unauthorized', 401],
    ['forbidden', 403],
    ['notFound', 404],
    ['conflict', 409],
    ['unprocessable', 422],
    ['internal', 500],
  ])('%s retorna un error con statusCode %i', (method, statusCode) => {
    const error = (ApiError as unknown as Record<string, (msg: string) => ApiError>)[
      method as string
    ]('mensaje de prueba');
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(statusCode);
  });

  it('conflict requiere un mensaje explicito', () => {
    const error = ApiError.conflict('El nombre ya existe');
    expect(error.message).toBe('El nombre ya existe');
  });
});
