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
import { upload } from '../middlewares/upload';

const router = Router();


router.get('/', listarPontos);
router.get('/:id', getPonto);

router.use(autenticar, apenasCooperativa);

router.get('/meus/lista', getMeusPontos);
router.post('/', upload.single('imagem'), criarPonto);
router.put('/:id', upload.single('imagem'), atualizarPonto);
router.delete('/:id', deletarPonto);

export default router;
