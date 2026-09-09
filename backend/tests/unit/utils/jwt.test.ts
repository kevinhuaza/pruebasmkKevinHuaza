import { signToken, verifyToken } from '../../../src/utils/jwt';

describe('utils/jwt', () => {
  it('firma un payload y permite verificarlo obteniendo los mismos datos', () => {
    const token = signToken({ sub: 42, role: 'admin' });
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(42);
    expect(decoded.role).toBe('admin');
  });

  it('lanza un error al verificar un token invalido', () => {
    expect(() => verifyToken('token-invalido')).toThrow();
  });

  it('lanza un error al verificar un token manipulado', () => {
    const token = signToken({ sub: 1, role: 'user' });
    const tampered = `${token}tampered`;
    expect(() => verifyToken(tampered)).toThrow();
  });
});
