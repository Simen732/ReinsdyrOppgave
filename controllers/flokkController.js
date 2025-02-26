const Flokk = require('../models/FlokkSchema');
const Eier = require('../models/EierSchema');
const transferController = require('./transferController');
const { v4: uuidv4 } = require('uuid');

const FlokkController = {
    renderAddFlokk: (req, res) => {
        res.render('addFlokk');
    },

    addFlokk: async (req, res) => {
        try {
            const eierId = req.user.eierId;

            const newFlokk = new Flokk({
                eier: eierId,
                flokkNavn: req.body.flokkNavn,
                serieIndeling: uuidv4(),
                buemerkeNavn: req.body.buemerkeNavn,
                buemerkeBilde: req.file ? req.file.filename : null,
                beiteomrade: req.body.beiteomrade,
                reinsdyr: []
            });

            await newFlokk.save();

            // Add the new flock to the owner's flokker array
            await Eier.findByIdAndUpdate(eierId, { $push: { flokker: newFlokk._id } });

            res.redirect('/flokk/profil'); // Redirect to a page showing all user's flocks
        } catch (err) {
            console.error('Error adding new flock:', err);
            res.status(500).send('Error adding new flock: ' + err.message);
        }
    },

    getProfile: async (req, res) => {
        try {
            const eierId = req.user.eierId; 
            const eier = await Eier.findById(eierId);
            const flokker = await Flokk.find({ eier: eierId });
            
            // Fetch pending transfer requests using the TransferController
            const transferRequests = await transferController.getTransferRequests(eierId);
            
            res.render('profil', { eier: eier, flokker: flokker, transferRequests: transferRequests });
        } catch (err) {
            console.error('Error fetching profile:', err);
            res.status(500).send('Error fetching profile: ' + err.message);
        }
    },

    getFlokkReinsdyr: async (req, res) => {
        try {
            const flokkId = req.params.flokkId;
            const flokk = await Flokk.findById(flokkId);
            
            if (!flokk) {
                return res.status(404).send('Flokk ikke funnet');
            }
        
            res.render('flokkReinsdyr', { flokk: flokk, reinsdyr: flokk.reinsdyr });
        } catch (err) {
            console.error('Feil ved henting av reinsdyr:', err);
            res.status(500).send('Feil ved henting av reinsdyr: ' + err.message);
        }
    },

    transferReinsdyr: async (req, res) => {
        try {
            const { fromFlokkId, toFlokkId, reinsdyrId } = req.body;
        
            // Find the source and destination flocks
            const fromFlokk = await Flokk.findById(fromFlokkId);
            const toFlokk = await Flokk.findById(toFlokkId);
        
            if (!fromFlokk || !toFlokk) {
                return res.status(404).send('En eller begge flokkene ble ikke funnet');
            }
        
            // Find the reindeer in the source flock
            const reinsdyrIndex = fromFlokk.reinsdyr.findIndex(r => r._id.toString() === reinsdyrId);
            if (reinsdyrIndex === -1) {
                return res.status(404).send('Reinsdyret ble ikke funnet i kildeflokken');
            }
        
            // Remove the reindeer from the source flock and add it to the destination flock
            const [reinsdyr] = fromFlokk.reinsdyr.splice(reinsdyrIndex, 1);
            toFlokk.reinsdyr.push(reinsdyr);
        
            // Save both flocks
            await fromFlokk.save();
            await toFlokk.save();
        
            res.redirect('/flokk/profil');
        } catch (err) {
            console.error('Feil ved overføring av reinsdyr:', err);
            res.status(500).send('Feil ved overføring av reinsdyr: ' + err.message);
        }
    }
};

module.exports = FlokkController;
