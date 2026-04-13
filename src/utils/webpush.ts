import webpush from 'web-push';
import { PushSubscription } from '../models/PushSubscription';
import logger from '../config/logger';

const vapidPublicKey  = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail      = process.env.VAPID_EMAIL;

if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
  throw new Error('Variáveis VAPID não configuradas: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL');
}

webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

interface PushPayload {
  title: string;
  message: string;
  pointId: string;
  cidade: string;
  tags: string[];
  url: string;
}

export const sendNewPointPushNotification = async (payload: PushPayload): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (payload.cidade) {
      filter.cidade = { $regex: payload.cidade, $options: 'i' };
    }

    const subscriptions = await PushSubscription.find(filter);

    if (subscriptions.length === 0) {
      logger.info({ cidade: payload.cidade }, 'Nenhuma assinatura ativa para notificar');
      return;
    }

    logger.info({ total: subscriptions.length, cidade: payload.cidade }, 'Disparando notificações push');

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys.p256dh,
                auth:   subscription.keys.auth,
              },
            },
            JSON.stringify(payload)
          );

          await PushSubscription.findByIdAndUpdate(subscription._id, {
            lastUsedAt: new Date(),
          });
        } catch (error: unknown) {
          const status = (error as { statusCode?: number }).statusCode;

          if (status === 410 || status === 404) {
            await PushSubscription.findByIdAndDelete(subscription._id);
            logger.warn({ endpoint: subscription.endpoint, status }, 'Assinatura inválida removida');
          } else {
            logger.error({ err: error, endpoint: subscription.endpoint }, 'Erro ao enviar notificação push');
          }
        }
      })
    );

    const sent   = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    logger.info({ sent, failed, cidade: payload.cidade }, 'Notificações push concluídas');
  } catch (error) {
    logger.error({ err: error }, 'Erro inesperado ao disparar notificações push');
  }
};