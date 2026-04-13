import { Request, Response } from 'express';
import { PontoColeta } from '../models/PontoColeta';
import { geocodificarEndereco } from '../utils/geocoding';
import { uploadImagem, deletarImagem } from '../utils/cloudinary';
import logger from '../config/logger';
import { sendNewPointPushNotification } from '../utils/webpush';

const montarEndereco = (
  logradouro: string,
  numero: string,
  bairro: string,
  cidade: string,
  uf: string,
  cep: string
): string => `${logradouro}, ${numero} - ${bairro}, ${cidade} - ${uf}, ${cep}`;

export const criarPonto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nome, cep, logradouro, numero, bairro, cidade, uf, horario, tags } = req.body;

    logger.info({ usuarioId: req.usuarioId, nome }, 'Tentativa de criação de ponto de coleta');

    const endereco = montarEndereco(logradouro, numero, bairro, cidade, uf, cep);
    const coordenadas = await geocodificarEndereco(endereco);

    let imagem: string | null = null;
    if (req.file) {
      imagem = await uploadImagem(req.file.buffer);
    }

    const ponto = await PontoColeta.create({
      nome, cep, logradouro, numero, bairro, cidade, uf, endereco,
      lat: coordenadas?.lat,
      lng: coordenadas?.lng,
      horario,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
      imagem,
      cooperativa: req.usuarioId,
    });

    logger.info({ usuarioId: req.usuarioId, pontoId: ponto._id, coordenadas }, 'Ponto de coleta criado com sucesso');

    sendNewPointPushNotification({
      pointId: String(ponto._id),
      title: 'Novo ponto de coleta! ♻️',
      message: `${ponto.nome} foi cadastrado em ${ponto.cidade} - ${ponto.uf}`,
      cidade: ponto.cidade,
      tags: ponto.tags,
      url: `/pontos-coleta/${ponto._id}`,
    });

    res.status(201).json({ mensagem: 'Ponto de coleta criado com sucesso.', ponto });
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null && 'name' in error &&
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
    const { tag, nome, cidade, uf } = req.query;

    logger.info({ filtros: { tag, nome, cidade, uf } }, 'Listando pontos de coleta');

    const filtro: Record<string, unknown> = {};
    if (tag)    filtro.tags   = { $in: [tag] };
    if (nome)   filtro.nome   = { $regex: nome, $options: 'i' };
    if (cidade) filtro.cidade = { $regex: cidade, $options: 'i' };
    if (uf)     filtro.uf     = String(uf).toUpperCase();

    const pontos = await PontoColeta.find(filtro)
      .populate('cooperativa', 'nome email telefone')
      .sort({ createdAt: -1 });

    logger.info({ filtros: { tag, nome, cidade, uf }, total: pontos.length }, 'Listagem de pontos de coleta concluída');
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
      logger.warn({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Tentativa de atualização de ponto de coleta sem permissão');
      res.status(403).json({ mensagem: 'Você não tem permissão para editar este ponto.' });
      return;
    }

    const { nome, cep, logradouro, numero, bairro, cidade, uf, horario, tags } = req.body;

    const enderecoMudou = logradouro || numero || bairro || cidade || uf || cep;
    let endereco = ponto.endereco;
    let lat = ponto.lat;
    let lng = ponto.lng;

    if (enderecoMudou) {
      endereco = montarEndereco(
        logradouro ?? ponto.logradouro,
        numero     ?? ponto.numero,
        bairro     ?? ponto.bairro,
        cidade     ?? ponto.cidade,
        uf         ?? ponto.uf,
        cep        ?? ponto.cep
      );
      const coordenadas = await geocodificarEndereco(endereco);
      lat = coordenadas?.lat;
      lng = coordenadas?.lng;
    }

    let imagem = ponto.imagem;
    if (req.file) {
      if (ponto.imagem) await deletarImagem(ponto.imagem);
      imagem = await uploadImagem(req.file.buffer) ?? ponto.imagem;
    }

    const atualizado = await PontoColeta.findByIdAndUpdate(
      req.params.id,
      {
        nome, cep, logradouro, numero, bairro, cidade, uf,
        endereco, lat, lng, horario,
        tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
        imagem,
      },
      { new: true, runValidators: true }
    );

    logger.info({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Ponto de coleta atualizado com sucesso');
    res.status(200).json({ mensagem: 'Ponto de coleta atualizado com sucesso.', ponto: atualizado });
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null && 'name' in error &&
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

    if (ponto.imagem) await deletarImagem(ponto.imagem);

    await PontoColeta.findByIdAndDelete(req.params.id);

    logger.info({ usuarioId: req.usuarioId, pontoId: req.params.id }, 'Ponto de coleta excluído com sucesso');
    res.status(200).json({ mensagem: 'Ponto de coleta excluído com sucesso.' });
  } catch (error) {
    logger.error({ err: error, usuarioId: req.usuarioId, pontoId: req.params.id }, 'Erro inesperado ao excluir ponto de coleta');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};