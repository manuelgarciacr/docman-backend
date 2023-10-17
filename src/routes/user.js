const { Router} = require('express');
const router = Router();
const userCtrl = require('../controllers/user.controller');

router.get('/user'); // all users
router.get('/user/:id'); // one user

router.post('/user:signup'); // one user
router.post('/user:login'); // one user
router.post('/user:logout'); // one user

router.patch('/user/'); // one user

router.delete('/user/:id'); // one document

module.exports = router;