import { Request, Response } from 'express';
import { Cooperative } from '../models/Cooperativa';
import logger from '../config/logger';

export const getPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info({ usuarioId: req.usuarioId }, 'Buscando perfil da cooperativa');

    const cooperativa = await Cooperative.findById(req.usuarioId);
    if (!cooperativa) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de busca de perfil para cooperativa inexistente');
      res.status(404).json({ mensagem: 'Cooperativa não encontrada.' });
      return;
    }

    logger.info({ usuarioId: req.usuarioId }, 'Perfil da cooperativa encontrado com sucesso');
    res.status(200).json({
      id: cooperativa._id,
      nome: cooperativa.nome,
      email: cooperativa.email,
      telefone: cooperativa.telefone,
      documento: cooperativa.documento,
    });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao buscar perfil da cooperativa');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const atualizarPerfil = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nome, telefone } = req.body;

    logger.info({ usuarioId: req.usuarioId, nome, telefone }, 'Tentativa de atualização de perfil da cooperativa');

    const atualizado = await Cooperative.findByIdAndUpdate(
      req.usuarioId,
      { nome, telefone },
      { new: true, runValidators: true }
    );

    if (!atualizado) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de atualização de perfil para cooperativa inexistente');
      res.status(404).json({ mensagem: 'Cooperativa não encontrada.' });
      return;
    }

    logger.info({ usuarioId: req.usuarioId }, 'Perfil da cooperativa atualizado com sucesso');
    res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      cooperativa: {
        id: atualizado._id,
        nome: atualizado.nome,
        email: atualizado.email,
        telefone: atualizado.telefone,
        documento: atualizado.documento,
      },
    });
  } catch (error: unknown) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao atualizar perfil da cooperativa');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const alterarSenha = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de alteração de senha sem preencher os campos obrigatórios');
      res.status(400).json({ mensagem: 'Senha atual e nova senha são obrigatórias.' });
      return;
    }

    if (novaSenha.length < 6) {
      logger.warn({ usuarioId: req.usuarioId, tamanho: novaSenha.length }, 'Tentativa de alteração de senha com nova senha muito curta');
      res.status(400).json({ mensagem: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    const cooperativa = await Cooperative.findById(req.usuarioId).select('+senha');
    if (!cooperativa) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de alteração de senha para cooperativa inexistente');
      res.status(404).json({ mensagem: 'Cooperativa não encontrada.' });
      return;
    }

    const senhaCorreta = await cooperativa.compararSenha(senhaAtual);
    if (!senhaCorreta) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de alteração de senha com senha atual incorreta');
      res.status(401).json({ mensagem: 'Senha atual incorreta.' });
      return;
    }

    cooperativa.senha = novaSenha;
    await cooperativa.save();

    logger.info({ usuarioId: req.usuarioId }, 'Senha da cooperativa alterada com sucesso');
    res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao tentar alterar senha da cooperativa');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const deletarConta = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info({ usuarioId: req.usuarioId }, 'Tentativa de exclusão de conta da cooperativa');

    const cooperativa = await Cooperative.findByIdAndDelete(req.usuarioId);
    if (!cooperativa) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de exclusão de conta para cooperativa inexistente');
      res.status(404).json({ mensagem: 'Cooperativa não encontrada.' });
      return;
    }

    logger.info({ usuarioId: req.usuarioId }, 'Conta da cooperativa excluída com sucesso');
    res.status(200).json({ mensagem: 'Conta excluída com sucesso.' });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao excluir conta da cooperativa');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};