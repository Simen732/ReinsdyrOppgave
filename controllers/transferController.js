const TransferRequest = require('../models/TransferSchema');
const Flokk = require('../models/FlokkSchema');
const Eier = require('../models/EierSchema');

const TransferController = {
    initiateTransfer: async (req, res) => {
        try {
          const { toUserEmail, reinsdyrId, flokkId } = req.body;
          const fromUserId = req.user.eierId;
      
      
          // Find the recipient user by email
          const toUser = await Eier.findOne({ epost: toUserEmail });
          if (!toUser) {
            console.log('Recipient user not found');
            return res.status(404).send('Recipient user not found');
          }
      
          const newTransferRequest = new TransferRequest({
            fromUser: fromUserId,
            toUser: toUser._id,
            reinsdyr: reinsdyrId,
            fromFlokk: flokkId
          });
      
          const savedRequest = await newTransferRequest.save();
      
          res.redirect('/flokk/profil');
        } catch (err) {
          console.error('Error initiating transfer:', err);
          res.status(500).send('Error initiating transfer: ' + err.message);
        }
      },

  acceptTransfer: async (req, res) => {
    try {
      const { requestId } = req.body;
      console.log('Accepting transfer request:', requestId);
  
      const transferRequest = await TransferRequest.findById(requestId);
      console.log('Transfer request found:', transferRequest);
  
      if (!transferRequest) {
        console.log('Transfer request not found');
        return res.status(404).send('Transfer request not found');
      }
  
      const sourceFlokk = await Flokk.findOne({ 'reinsdyr._id': transferRequest.reinsdyr });
      console.log('Source flokk found:', sourceFlokk ? sourceFlokk._id : 'Not found');
  
      const destinationFlokk = await Flokk.findOne({ eier: transferRequest.toUser });
      console.log('Destination flokk found:', destinationFlokk ? destinationFlokk._id : 'Not found');
  
      if (!sourceFlokk || !destinationFlokk) {
        console.log('Source or destination flokk not found');
        return res.status(404).send('Source or destination flokk not found');
      }
  
      const reinsdyr = sourceFlokk.reinsdyr.id(transferRequest.reinsdyr);
      console.log('Reindeer to transfer:', reinsdyr);
  
      if (!reinsdyr) {
        console.log('Reindeer not found in source flokk');
        return res.status(404).send('Reindeer not found in source flokk');
      }
  
      sourceFlokk.reinsdyr.pull(reinsdyr);
      destinationFlokk.reinsdyr.push(reinsdyr);
  
      await sourceFlokk.save();
      await destinationFlokk.save();
  
      transferRequest.status = 'completed';
      await transferRequest.save();
  
      console.log('Transfer completed successfully');
      res.redirect('/flokk/profil');
    } catch (err) {
      console.error('Error accepting transfer:', err);
      res.status(500).send('Error accepting transfer: ' + err.message);
    }
  },

  declineTransfer: async (req, res) => {
    try {
      const { requestId } = req.body;
      await TransferRequest.findByIdAndUpdate(requestId, { status: 'declined' });
      res.redirect('/flokk/profil');
    } catch (err) {
      console.error('Error declining transfer:', err);
      res.status(500).send('Error declining transfer: ' + err.message);
    }
  },

  confirmTransfer: async (req, res) => {
    try {
      const { requestId } = req.body;
      const request = await TransferRequest.findById(requestId).populate('reinsdyr fromFlokk');
      
      // Remove reindeer from sender's flock
      await Flokk.updateOne(
        { _id: request.fromFlokk._id },
        { $pull: { reinsdyr: { _id: request.reinsdyr._id } } }
      );

      // Add reindeer to receiver's flock (assuming they have at least one flock)
      const receiverFlokk = await Flokk.findOne({ eier: request.toUser });
      if (receiverFlokk) {
        await Flokk.updateOne(
          { _id: receiverFlokk._id },
          { $push: { reinsdyr: request.reinsdyr } }
        );
      } else {
        // Handle case where receiver has no flocks
        throw new Error('Receiver has no flocks to add the reindeer to');
      }

      await TransferRequest.findByIdAndUpdate(requestId, { status: 'completed' });
      res.redirect('/flokk/profil');
    } catch (err) {
      console.error('Error confirming transfer:', err);
      res.status(500).send('Error confirming transfer: ' + err.message);
    }
  },

  getTransferRequests: async (eierId) => {
    try {
      const eierIdString = eierId.toString();
      console.log('Searching for requests for eier:', eierIdString);
      
      const requests = await TransferRequest.find({ 
        $or: [{ fromUser: eierIdString }, { toUser: eierIdString }],
        status: 'pending' 
      })
      .populate('fromUser', 'navn')
      .populate('toUser', 'navn')
      .populate('fromFlokk', 'flokkNavn reinsdyr');
  
      console.log('Raw requests:', JSON.stringify(requests, null, 2));
  
      const processedRequests = requests.map(request => {
        console.log('Processing request:', request._id.toString());
        console.log('FromFlokk:', request.fromFlokk);
        
        if (!request.fromFlokk) {
          console.warn('FromFlokk is undefined for request:', request._id.toString());
          return request.toObject();
        }
  
        if (!Array.isArray(request.fromFlokk.reinsdyr)) {
          console.warn('Reinsdyr is not an array for request:', request._id.toString());
          return request.toObject();
        }
  
        const reinsdyr = request.fromFlokk.reinsdyr.find(r => r._id.toString() === request.reinsdyr.toString());
        console.log('Found reinsdyr:', reinsdyr);
  
        return {
          ...request.toObject(),
          reinsdyr: reinsdyr || { navn: 'Unknown' }
        };
      });
      
      console.log('Processed transfer requests:', JSON.stringify(processedRequests, null, 2));
      return processedRequests;
    } catch (err) {
      console.error('Error getting transfer requests:', err);
      throw err;
    }
  }
  
};  

module.exports = TransferController;
