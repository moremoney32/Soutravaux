import { Router } from 'express';
import { connectSse } from '../controllers/SseController';


const router = Router();

// Route unique pour connexion SSE
router.get('/connect', connectSse);

export default router;