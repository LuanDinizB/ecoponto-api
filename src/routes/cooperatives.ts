import { Router } from 'express';
import { getPerfil, atualizarPerfil, alterarSenha, deletarConta } from '../controllers/cooperativaController';
import { autenticar, apenasCooperativa } from '../middlewares/auth';

const router = Router();

router.use(autenticar, apenasCooperativa);

router.get('/perfil', getPerfil);
router.put('/perfil', atualizarPerfil);
router.put('/senha', alterarSenha);

router.delete('/perfil', deletarConta);

export default router;