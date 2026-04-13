import mongoose, { Schema } from 'mongoose';
import { IPushSubscription } from '../types/pushSubscription';

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
    cidade: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    platform: {
      type: String,
      trim: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const PushSubscription = mongoose.model<IPushSubscription>(
  'PushSubscription',
  PushSubscriptionSchema
);