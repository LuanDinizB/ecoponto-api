import { Request, Response } from 'express';
import { User } from '../models/User';
import { gerarToken } from '../utils/jwt';
import logger from '../config/logger';

export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, telefone, documento, senha } = req.body;

    logger.info({ email, documento }, 'Tentativa de registro de usuário');

    if (!documento) {
      logger.warn({ email }, 'Tentativa de registro sem documento');
      res.status(400).json({ mensagem: 'CPF ou CNPJ é obrigatório.' });
      return;
    }

    const emailExistente = await User.findOne({ email });
    if (emailExistente) {
      logger.warn({ email }, 'Tentativa de registro com email já cadastrado');
      res.status(409).json({ mensagem: 'Email já cadastrado.' });
      return;
    }

    const documentoExistente = await User.findOne({ documento });
    if (documentoExistente) {
      logger.warn({ documento }, 'Tentativa de registro com CPF/CNPJ já cadastrado');
      res.status(409).json({ mensagem: 'CPF/CNPJ já cadastrado.' });
      return;
    }

    const usuario = await User.create({ nome, email, telefone, documento, senha });

    const token = gerarToken({
      id: String(usuario._id),
      cooperativa: usuario.cooperativa,
    });

    logger.info({ usuarioId: usuario._id, email, cooperativa: usuario.cooperativa }, 'Usuário registrado com sucesso');
    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        documento: usuario.documento,
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
      logger.warn({ err: error }, 'Erro de validação ao registrar usuário');
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    logger.error({ err: error }, 'Erro inesperado ao registrar usuário');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    logger.info({ email }, 'Tentativa de login');

    if (!email || !senha) {
      logger.warn({ email }, 'Tentativa de login sem email ou senha');
      res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
      return;
    }

    const usuario = await User.findOne({ email }).select('+senha');
    if (!usuario) {
      logger.warn({ email }, 'Tentativa de login com email não cadastrado');
      res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      return;
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      logger.warn({ email, usuarioId: usuario._id }, 'Tentativa de login com senha incorreta');
      res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      return;
    }

    const token = gerarToken({
      id: String(usuario._id),
      cooperativa: usuario.cooperativa,
    });

    logger.info({ usuarioId: usuario._id, email, cooperativa: usuario.cooperativa }, 'Login realizado com sucesso');
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
  } catch (error) {
    logger.error({ err: error }, 'Erro inesperado ao realizar login');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};