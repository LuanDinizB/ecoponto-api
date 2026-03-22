import { Router } from 'express';
import {
  criarPonto,
  listarPontos,
  getPonto,
  getMeusPontos,
  atualizarPonto,
  deletarPonto,
} from '../controllers/pontoColetaController';
import { autenticar, apenasCooperativa } from '../middlewares/auth';

const router = Router();


router.get('/', listarPontos);
router.get('/:id', getPonto);
router.use(autenticar, apenasCooperativa);
router.get('/meus/lista', getMeusPontos);
router.post('/', criarPonto);
router.put('/:id', atualizarPonto);
router.delete('/:id', deletarPonto);

export default router;
