const { Router} = require('express');
const router = Router();

router.get('/', (_, res) => res.send('Hi'))

module.exports = router;