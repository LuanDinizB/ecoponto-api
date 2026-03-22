import { Request, Response } from 'express';
import { PontoColeta } from '../models/PontoColeta';

export const criarPonto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nome, endereco, horario, tags } = req.body;

    const ponto = await PontoColeta.create({
      nome,
      endereco,
      horario,
      tags,
      cooperativa: req.usuarioId,
    });

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
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const listarPontos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tag, nome } = req.query;

    const filtro: Record<string, unknown> = {};

    if (tag) {
      filtro.tags = { $in: [tag] };
    }

    if (nome) {
      filtro.nome = { $regex: nome, $options: 'i' };
    }

    const pontos = await PontoColeta.find(filtro)
      .populate('cooperativa', 'nome email telefone')
      .sort({ createdAt: -1 });

    res.status(200).json({ total: pontos.length, pontos });
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const getPonto = async (req: Request, res: Response): Promise<void> => {
  try {
    const ponto = await PontoColeta.findById(req.params.id).populate(
      'cooperativa',
      'nome email telefone'
    );

    if (!ponto) {
      res.status(404).json({ mensagem: 'Ponto de coleta não encontrado.' });
      return;
    }

    res.status(200).json(ponto);
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const getMeusPontos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pontos = await PontoColeta.find({ cooperativa: req.usuarioId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ total: pontos.length, pontos });
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const atualizarPonto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ponto = await PontoColeta.findById(req.params.id);

    if (!ponto) {
      res.status(404).json({ mensagem: 'Ponto de coleta não encontrado.' });
      return;
    }

    if (String(ponto.cooperativa) !== req.usuarioId) {
      res
        .status(403)
        .json({ mensagem: 'Você não tem permissão para editar este ponto.' });
      return;
    }

    const { nome, endereco, horario, tags } = req.body;

    const atualizado = await PontoColeta.findByIdAndUpdate(
      req.params.id,
      { nome, endereco, horario, tags },
      { new: true, runValidators: true }
    );

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
      res.status(400).json({ mensagem: (error as Error).message });
      return;
    }
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const deletarPonto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ponto = await PontoColeta.findById(req.params.id);

    if (!ponto) {
      res.status(404).json({ mensagem: 'Ponto de coleta não encontrado.' });
      return;
    }

    if (String(ponto.cooperativa) !== req.usuarioId) {
      res
        .status(403)
        .json({ mensagem: 'Você não tem permissão para excluir este ponto.' });
      return;
    }

    await PontoColeta.findByIdAndDelete(req.params.id);

    res.status(200).json({ mensagem: 'Ponto de coleta excluído com sucesso.' });
  } catch {
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};
