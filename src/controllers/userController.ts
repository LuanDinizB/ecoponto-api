import { Request, Response } from 'express';
import { User } from '../models/User';
import logger from '../config/logger';

export const getPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info({ usuarioId: req.usuarioId }, 'Buscando perfil do usuário');

    const usuario = await User.findById(req.usuarioId);
    if (!usuario) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de busca de perfil para usuário inexistente');
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    logger.info({ usuarioId: req.usuarioId }, 'Perfil encontrado com sucesso');
    res.status(200).json({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
    });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao buscar perfil');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const atualizarPerfil = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nome } = req.body;

    logger.info({ usuarioId: req.usuarioId, nome }, 'Tentativa de atualização de perfil');

    const atualizado = await User.findByIdAndUpdate(
      req.usuarioId,
      { nome },
      { new: true, runValidators: true }
    );

    if (!atualizado) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de atualização de perfil para usuário inexistente');
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    logger.info({ usuarioId: req.usuarioId }, 'Perfil atualizado com sucesso');
    res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: {
        id: atualizado._id,
        nome: atualizado.nome,
        email: atualizado.email,
      },
    });
  } catch (error: unknown) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao atualizar perfil');
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

    const usuario = await User.findById(req.usuarioId).select('+senha');
    if (!usuario) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de alteração de senha para usuário inexistente');
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    const senhaCorreta = await usuario.compararSenha(senhaAtual);
    if (!senhaCorreta) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de alteração de senha com senha atual incorreta');
      res.status(401).json({ mensagem: 'Senha atual incorreta.' });
      return;
    }

    usuario.senha = novaSenha;
    await usuario.save();

    logger.info({ usuarioId: req.usuarioId }, 'Senha alterada com sucesso');
    res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao tentar alterar senha');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const deletarConta = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info({ usuarioId: req.usuarioId }, 'Tentativa de exclusão de conta');

    const usuario = await User.findByIdAndDelete(req.usuarioId);
    if (!usuario) {
      logger.warn({ usuarioId: req.usuarioId }, 'Tentativa de exclusão de conta para usuário inexistente');
      res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      return;
    }

    logger.info({ usuarioId: req.usuarioId }, 'Conta excluída com sucesso');
    res.status(200).json({ mensagem: 'Conta excluída com sucesso.' });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao excluir conta');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};