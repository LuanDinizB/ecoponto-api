import { Request, Response } from 'express';
import { User } from '../models/User';
import { Cooperative } from '../models/Cooperativa';
import { gerarToken } from '../utils/jwt';
import logger from '../config/logger';

export const registroUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;

    logger.info({ email }, 'Tentativa de registro de usuário');

    const emailExistente = await User.findOne({ email });
    if (emailExistente) {
      logger.warn({ email }, 'Tentativa de registro com email já cadastrado');
      res.status(409).json({ mensagem: 'Email já cadastrado.' });
      return;
    }

    const usuario = await User.create({ nome, email, senha });

    const token = gerarToken({ id: String(usuario._id), tipo: 'user' });

    logger.info({ usuarioId: usuario._id, email }, 'Usuário registrado com sucesso');
    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
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
export const registroCooperativa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, telefone, documento, senha } = req.body;

    logger.info({ email, documento }, 'Tentativa de registro de cooperativa');

    if (!documento) {
      logger.warn({ email }, 'Tentativa de registro de cooperativa sem CNPJ');
      res.status(400).json({ mensagem: 'CNPJ é obrigatório.' });
      return;
    }

    const emailExistente = await Cooperative.findOne({ email });
    if (emailExistente) {
      logger.warn({ email }, 'Tentativa de registro de cooperativa com email já cadastrado');
      res.status(409).json({ mensagem: 'Email já cadastrado.' });
      return;
    }

    const documentoExistente = await Cooperative.findOne({ documento });
    if (documentoExistente) {
      logger.warn({ documento }, 'Tentativa de registro com CNPJ já cadastrado');
      res.status(409).json({ mensagem: 'CNPJ já cadastrado.' });
      return;
    }

    const cooperativa = await Cooperative.create({ nome, email, telefone, documento, senha });

    const token = gerarToken({ id: String(cooperativa._id), tipo: 'cooperative' });

    logger.info({ cooperativaId: cooperativa._id, email }, 'Cooperativa registrada com sucesso');
    res.status(201).json({
      mensagem: 'Cooperativa cadastrada com sucesso.',
      token,
      cooperativa: {
        id: cooperativa._id,
        nome: cooperativa.nome,
        email: cooperativa.email,
        telefone: cooperativa.telefone,
        documento: cooperativa.documento,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'ValidationError'
    ) {
      logger.warn({ err: error }, 'Erro de validação ao registrar cooperativa');
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    logger.error({ err: error }, 'Erro inesperado ao registrar cooperativa');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    logger.info({ email }, 'Tentativa de login de usuário');

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

    const token = gerarToken({ id: String(usuario._id), tipo: 'user' });

    logger.info({ usuarioId: usuario._id, email }, 'Login de usuário realizado com sucesso');
    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Erro inesperado ao realizar login de usuário');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const loginCooperativa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    logger.info({ email }, 'Tentativa de login de cooperativa');

    if (!email || !senha) {
      logger.warn({ email }, 'Tentativa de login sem email ou senha');
      res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
      return;
    }

    const cooperativa = await Cooperative.findOne({ email }).select('+senha');
    if (!cooperativa) {
      logger.warn({ email }, 'Tentativa de login com email não cadastrado');
      res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      return;
    }

    const senhaCorreta = await cooperativa.compararSenha(senha);
    if (!senhaCorreta) {
      logger.warn({ email, cooperativaId: cooperativa._id }, 'Tentativa de login com senha incorreta');
      res.status(401).json({ mensagem: 'Credenciais inválidas.' });
      return;
    }

    const token = gerarToken({ id: String(cooperativa._id), tipo: 'cooperative' });

    logger.info({ cooperativaId: cooperativa._id, email }, 'Login de cooperativa realizado com sucesso');
    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      cooperativa: {
        id: cooperativa._id,
        nome: cooperativa.nome,
        email: cooperativa.email,
        telefone: cooperativa.telefone,
        documento: cooperativa.documento,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Erro inesperado ao realizar login de cooperativa');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};