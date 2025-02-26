const express = require('express');
const router = express.Router();
const FlokkController = require('../controllers/flokkController');
const verifyToken = require('../middleware/jwtVerify');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/add', verifyToken, FlokkController.renderAddFlokk);
router.post('/add', verifyToken, upload.single('buemerkeBilde'), FlokkController.addFlokk);
router.get('/profil', verifyToken, FlokkController.getProfile);
router.get('/:flokkId/reinsdyr', verifyToken, FlokkController.getFlokkReinsdyr);
router.post('/transfer-reinsdyr', verifyToken, FlokkController.transferReinsdyr);


module.exports = router;
