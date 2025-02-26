const ReinsdyrController = require('../controllers/reinsdyrController');
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/jwtVerify');

router.post('/RegistrerReinsdyr', verifyToken, ReinsdyrController.register);

router.get('/RegistrerReinsdyr', verifyToken, ReinsdyrController.RenderRegister);

module.exports = router;