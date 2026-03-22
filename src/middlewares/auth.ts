import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string;
      usuarioCooperativa?: boolean;
    }
  }
}

export const autenticar = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ mensagem: 'Token não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token);
    req.usuarioId = payload.id;
    req.usuarioCooperativa = payload.cooperativa;
    next();
  } catch {
    res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
};

export const apenasCooperativa = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.usuarioCooperativa) {
    res
      .status(403)
      .json({ mensagem: 'Acesso restrito a cooperativas.' });
    return;
  }
  next();
};
