const { Router} = require('express');
const router = Router();
const documentCtrl = require('../controllers/document.controller');

router.get('/document'); // all documents
router.get('/document/:id'); // one document
router.get('/document/:id/view', documentCtrl.renderDocument); // one document render
router.get('/document/:id/data'); // one document metadata
router.get('/document/:id/object'); // one document object

router.post('/document'); // one or more documents

router.patch('/document/'); // one document

router.delete('/document/:id'); // one document

module.exports = router;