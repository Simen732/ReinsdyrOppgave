const express = require('express');
const router = express.Router();
const TransferController = require('../controllers/transferController');
const verifyToken = require('../middleware/jwtVerify');

router.post('/initiate-transfer', verifyToken, TransferController.initiateTransfer);
router.post('/accept-transfer', verifyToken, TransferController.acceptTransfer);
router.post('/decline-transfer', verifyToken, TransferController.declineTransfer);
router.post('/confirm-transfer', verifyToken, TransferController.confirmTransfer);

module.exports = router;
