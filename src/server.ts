import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import logger from './config/logger';

const PORT = process.env.PORT ?? 3000;

const iniciar = async () => {
  logger.info({ env: process.env.NODE_ENV, port: PORT }, 'Iniciando aplicação');
  await connectDB();
  app.listen(PORT, () => {
    logger.info({ env: process.env.NODE_ENV, port: PORT }, 'Aplicação iniciada e pronta para receber requisições');
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
};

iniciar();