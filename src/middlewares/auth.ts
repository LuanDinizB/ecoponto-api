import { Request, Response, NextFunction } from 'express';
import { verificarToken, TipoUsuario } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string;
      usuarioTipo?: TipoUsuario;
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
    req.usuarioTipo = payload.tipo;
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
  if (req.usuarioTipo !== 'cooperative') {
    res.status(403).json({ mensagem: 'Acesso restrito a cooperativas.' });
    return;
  }
  next();
};