import { Router } from 'express';
import {
  registroUsuario,
  registroCooperativa,
  loginUsuario,
  loginCooperativa,
} from '../controllers/authController';

const router = Router();

router.post('/registro/usuario', registroUsuario);
router.post('/registro/cooperativa', registroCooperativa);

router.post('/login/usuario', loginUsuario);
router.post('/login/cooperativa', loginCooperativa);

export default router;