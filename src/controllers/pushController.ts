import { Request, Response } from 'express';
import { PushSubscription } from '../models/PushSubscription';
import logger from '../config/logger';

export const getPublicKey = (_req: Request, res: Response): void => {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

export const saveSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { endpoint, keys, cidade, userAgent, platform } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ mensagem: 'endpoint e keys (p256dh, auth) são obrigatórios.' });
      return;
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        userId: req.usuarioId,
        endpoint,
        keys,
        cidade,
        userAgent,
        platform,
        lastUsedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    logger.info({ userId: req.usuarioId, cidade }, 'Assinatura push salva com sucesso');
    res.status(201).json({ mensagem: 'Assinatura salva com sucesso.' });
  } catch (error) {
    logger.error({ err: error, userId: req.usuarioId }, 'Erro ao salvar assinatura push');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};

export const removeSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ mensagem: 'endpoint é obrigatório.' });
      return;
    }

    await PushSubscription.findOneAndDelete({ endpoint, userId: req.usuarioId });

    logger.info({ userId: req.usuarioId }, 'Assinatura push removida com sucesso');
    res.status(200).json({ mensagem: 'Assinatura removida com sucesso.' });
  } catch (error) {
    logger.error({ err: error, userId: req.usuarioId }, 'Erro ao remover assinatura push');
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
};