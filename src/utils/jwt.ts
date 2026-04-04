import jwt from 'jsonwebtoken';

export type TipoUsuario = 'user' | 'cooperative';

interface TokenPayload {
  id: string;
  tipo: TipoUsuario;
}

export const gerarToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  if (!secret) throw new Error('JWT_SECRET não definido.');

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verificarToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não definido.');

  return jwt.verify(token, secret) as TokenPayload;
};