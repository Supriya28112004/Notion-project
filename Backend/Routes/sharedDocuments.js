import express from 'express';
const router = express.Router();
// const auth = require('../middleware/auth');
import {getSharedUsers, shareDocument} from '../controllers/shareController.js';

router.post('/:documentId/share', shareDocument);
router.get('/:documentId/shared-users', getSharedUsers);

export default router;
