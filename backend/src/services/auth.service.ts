import bcrypt from 'bcryptjs';
import { User } from '../models';
import { UserRole } from '../models/user.model';
import { signToken } from '../utils/jwt';
import ApiError from '../utils/ApiError';

const SALT_ROUNDS = 12;

export interface RegisterInput {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface PublicUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export async function register({ username, password, role }: RegisterInput): Promise<PublicUser> {
  const existing = await User.findOne({ where: { username } });
  if (existing) {
    throw ApiError.conflict('Ya existe un usuario con ese nombre');
  }

   const isFirstUser = (await User.count()) === 0;
  const finalRole: UserRole = isFirstUser ? role : 'user';

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ username, password: hashedPassword, role: finalRole });

  return { id: user.id, username: user.username, role: user.role };
}

export async function login({ username, password }: LoginInput): Promise<LoginResult> {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw ApiError.unauthorized('Credenciales invalidas');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Credenciales invalidas');
  }

  const token = signToken({ sub: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, username: user.username, role: user.role },
  };
}
