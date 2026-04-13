import { Document } from 'mongoose';

export interface IPushSubscription extends Document {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  cidade?: string;
  userAgent?: string;
  platform?: string;
  createdAt: Date;
  lastUsedAt: Date;
}