const mongoose = require('mongoose');

const TransferRequestSchema = new mongoose.Schema({
    fromUser: { type: String },
    toUser: { type: String },
    reinsdyr: { type: mongoose.Schema.Types.ObjectId },
    fromFlokk: { type: mongoose.Schema.Types.ObjectId, ref: 'Flokk' },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  });
  
  const TransferRequest = mongoose.model('TransferRequest', TransferRequestSchema);
  

module.exports = TransferRequest;
