const ReinsdyrController = require('../controllers/reinsdyrController');
const express = require('express');
const router = express.Router();

router.post('/RegistrerReinsdyr', ReinsdyrController.register);

router.get('/RegistrerReinsdyr', ReinsdyrController.RenderRegister);

module.exports = router;