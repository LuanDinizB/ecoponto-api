import mongoose from 'mongoose';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI não definida nas variáveis de ambiente');
    process.exit(1);
  }

  try {
    logger.info('Conectando ao MongoDB...');
    await mongoose.connect(uri);
    logger.info('MongoDB conectado com sucesso');
  } catch (error) {
    logger.error({ err: error }, 'Erro ao conectar no MongoDB');
    process.exit(1);
  }
};