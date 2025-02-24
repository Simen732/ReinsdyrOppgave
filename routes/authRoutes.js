const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 


router.post('/login', authController.login);
router.get('/login', authController.RenderLogin);


router.get('/register', authController.RenderRegister);
router.post('/register', authController.register);

module.exports = router;
