import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import cooperativeRoutes from './routes/cooperatives';
import pontoColetaRoutes from './routes/pontosColeta';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/usuarios', userRoutes);
app.use('/cooperativas', cooperativeRoutes);
app.use('/pontos-coleta', pontoColetaRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

export default app;