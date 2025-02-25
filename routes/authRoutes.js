const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const upload = require('../middleware/multerMiddleware.js');


router.post('/login', authController.login);
router.get('/login', authController.RenderLogin);


router.get('/register', authController.RenderRegister);
router.post('/register', upload.single('buemerkeBilde'), authController.register);

module.exports = router;
