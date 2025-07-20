import express from 'express';
const router = express.Router();
// const auth = require('../middleware/auth');
import {restoreVersion, getDocumentHistory} from '../controllers/historyController.js';

// Get history of a document
router.get('/', getDocumentHistory);
// Restore from history
router.post('/restore/:historyId', restoreVersion);

export default router;
