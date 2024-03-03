//const { Router} = require('express');

import { Router } from 'express';
import { renderCtrl } from '../controllers/index.js';

const router = Router();

//router.get('/document', indexCtrl.renderDocument)
router.get('/render', renderCtrl.renderDocument)

//module.exports = router;
export { router as renderingsRouter };
