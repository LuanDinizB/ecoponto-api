import { Request, Response } from 'express';
import { User } from '../models/User';
import { gerarToken } from '../utils/jwt';

export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, telefone, cooperativa, senha } = req.body;

    const emailExistente = await User.findOne({ email });
    if (emailExistente) {
      res.status(409).json({ mensagem: 'Email já cadastrado.' });
      return;
    }

    const usuario = await User.create({
      nome,
      email,
      telefone,
      cooperativa: cooperativa ?? false,
      senha,
    });

    const token = gerarToken({
      id: String(usuario._id),
      cooperativa: usuario.cooperativa,
    });

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cooperativa: usuario.cooperativa,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'ValidationError'
    ) {
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
      return;
    }

    const usuario = await User.findOne({ email }).select('+senha');
    if (!usuario) {
      res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      return;
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      return;
    }

    const token = gerarToken({
      id: String(usuario._id),
      cooperativa: usuario.cooperativa,
    });

    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cooperativa: usuario.cooperativa,
      },
    });
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};
