import { Router } from 'express';
import { getPublicKey, saveSubscription, removeSubscription } from '../controllers/pushController';
import { autenticar } from '../middlewares/auth';

const router = Router();

router.get('/public-key', getPublicKey);

router.post('/subscriptions', autenticar, saveSubscription);

router.delete('/subscriptions', autenticar, removeSubscription);

export default router;