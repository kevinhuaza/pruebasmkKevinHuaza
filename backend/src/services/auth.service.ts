import bcrypt from 'bcryptjs';
import { User } from '../models';
import { UserRole } from '../models/user.model';
import { signToken } from '../utils/jwt';
import ApiError from '../utils/ApiError';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  nombre: string;
  password: string;
  rol: UserRole;
}

export interface LoginInput {
  nombre: string;
  password: string;
}

export interface PublicUser {
  id: number;
  nombre: string;
  rol: UserRole;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export async function register({ nombre, password, rol }: RegisterInput): Promise<PublicUser> {
  const existing = await User.findOne({ where: { nombre } });
  if (existing) {
    throw ApiError.conflict('Ya existe un usuario con ese nombre');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ nombre, password: hashedPassword, rol });

  return { id: user.id, nombre: user.nombre, rol: user.rol };
}

export async function login({ nombre, password }: LoginInput): Promise<LoginResult> {
  const user = await User.findOne({ where: { nombre } });
  if (!user) {
    throw ApiError.unauthorized('Credenciales invalidas');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Credenciales invalidas');
  }

  const token = signToken({ sub: user.id, rol: user.rol });

  return {
    token,
    user: { id: user.id, nombre: user.nombre, rol: user.rol },
  };
}
