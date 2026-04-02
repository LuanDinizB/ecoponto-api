import { Request, Response } from 'express';
import { PontoColeta } from '../models/PontoColeta';
import logger from '../config/logger';

export const criarPonto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nome, endereco, horario, tags } = req.body;

    logger.info({ usuarioId: req.usuarioId, nome }, 'Tentativa de criação de ponto de coleta');

    const ponto = await PontoColeta.create({
      nome,
      endereco,
      horario,
      tags,
      cooperativa: req.usuarioId,
    });

    logger.info({ usuarioId: req.usuarioId, pontoId: ponto._id }, 'Ponto de coleta criado com sucesso');
    res.status(201).json({
      mensagem: 'Ponto de coleta criado com sucesso.',
      ponto,
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'ValidationError'
    ) {
      logger.warn({ err: error, usuarioId: req.usuarioId }, 'Erro de validação ao criar ponto de coleta');
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao criar ponto de coleta');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const listarPontos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tag, nome } = req.query;

    logger.info({ filtros: { tag, nome } }, 'Listando pontos de coleta');

    const filtro: Record<string, unknown> = {};

    if (tag) filtro.tags = { $in: [tag] };
    if (nome) filtro.nome = { $regex: nome, $options: 'i' };

    const pontos = await PontoColeta.find(filtro)
      .populate('cooperativa', 'nome email telefone')
      .sort({ createdAt: -1 });

    logger.info({ filtros: { tag, nome }, total: pontos.length }, 'Listagem de pontos de coleta concluída');
    res.status(200).json({ total: pontos.length, pontos });
  } catch (error) {
    logger.error({ err: error }, 'Erro inesperado ao listar pontos de coleta');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const getPonto = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info({ pontoId: req.params.id }, 'Buscando ponto de coleta');

    const ponto = await PontoColeta.findById(req.params.id).populate(
      'cooperativa',
      'nome email telefone'
    );

    if (!ponto) {
      logger.warn({ pontoId: req.params.id }, 'Ponto de coleta não encontrado');
      res.status(404).json({ mensagem: 'Ponto de coleta não encontrado.' });
      return;
    }

    logger.info({ pontoId: req.params.id }, 'Ponto de coleta encontrado com sucesso');
    res.status(200).json(ponto);
  } catch (error) {
    logger.error({ err: error, pontoId: req.params.id }, 'Erro inesperado ao buscar ponto de coleta');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const getMeusPontos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info({ usuarioId: req.usuarioId }, 'Buscando pontos de coleta da cooperativa');

    const pontos = await PontoColeta.find({ cooperativa: req.usuarioId }).sort({
      createdAt: -1,
    });

    logger.info({ usuarioId: req.usuarioId, total: pontos.length }, 'Pontos de coleta da cooperativa listados com sucesso');
    res.status(200).json({ total: pontos.length, pontos });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId }, 'Erro inesperado ao buscar pontos da cooperativa');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const atualizarPonto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Tentativa de atualização de ponto de coleta');

    const ponto = await PontoColeta.findById(req.params.id);

    if (!ponto) {
      logger.warn({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Tentativa de atualização de ponto de coleta inexistente');
      res.status(404).json({ mensagem: 'Ponto de coleta não encontrado.' });
      return;
    }

    if (String(ponto.cooperativa) !== req.usuarioId) {
      logger.warn({ usuarioId: req.usuarioId, pontoId: req.params.id, dono: ponto.cooperativa }, 'Tentativa de atualização de ponto de coleta sem permissão');
      res.status(403).json({ mensagem: 'Você não tem permissão para editar este ponto.' });
      return;
    }

    const { nome, endereco, horario, tags } = req.body;

    const atualizado = await PontoColeta.findByIdAndUpdate(
      req.params.id,
      { nome, endereco, horario, tags },
      { new: true, runValidators: true }
    );

    logger.info({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Ponto de coleta atualizado com sucesso');
    res.status(200).json({
      mensagem: 'Ponto de coleta atualizado com sucesso.',
      ponto: atualizado,
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'ValidationError'
    ) {
      logger.warn({ err: error, usuarioId: req.usuarioId, pontoId: req.params.id }, 'Erro de validação ao atualizar ponto de coleta');
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    logger.error({ err: error, usuarioId: req.usuarioId, pontoId: req.params.id }, 'Erro inesperado ao atualizar ponto de coleta');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const deletarPonto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Tentativa de exclusão de ponto de coleta');

    const ponto = await PontoColeta.findById(req.params.id);

    if (!ponto) {
      logger.warn({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Tentativa de exclusão de ponto de coleta inexistente');
      res.status(404).json({ mensagem: 'Ponto de coleta não encontrado.' });
      return;
    }

    if (String(ponto.cooperativa) !== req.usuarioId) {
      logger.warn({ usuarioId: req.usuarioId, pontoId: req.params.id, dono: ponto.cooperativa }, 'Tentativa de exclusão de ponto de coleta sem permissão');
      res.status(403).json({ mensagem: 'Você não tem permissão para excluir este ponto.' });
      return;
    }

    await PontoColeta.findByIdAndDelete(req.params.id);

    logger.info({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Ponto de coleta excluído com sucesso');
    res.status(200).json({ mensagem: 'Ponto de coleta excluído com sucesso.' });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId, pontoId: req.params.id }, 'Erro inesperado ao excluir ponto de coleta');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};