const { Router} = require('express');
const router = Router();
const groupCtrl = require('../controllers/group.controller'); // groups of documents

router.get('/group'); // all groups
router.get('/group/:id'); // one group
router.get('/group/:id/view', groupCtrl.renderGroup); // one group render
router.get('/group/:id/data'); // one group metadatas
router.get('/group/:id/object'); // one group objects

router.post('/group'); // one or more groupss

router.patch('/group'); // one group

router.delete('/group/:id'); // one group

module.exports = router;