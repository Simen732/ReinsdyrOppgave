const Flokk = require('../models/FlokkSchema.js');
const Eier = require('../models/EierSchema.js');

const ReinsdyrController = {
    RenderRegister: async (req, res) => {
        try {
            const eierId = req.user.eierId;
            const eier = await Eier.findById(eierId).populate('flokker');
            res.render('RegistrerReinsdyr', { userId: req.user.userId, flokker: eier.flokker });
        } catch (err) {
            console.error('Error fetching flocks:', err);
            res.status(500).send('Error fetching flocks: ' + err.message);
        }
    },

    register: async (req, res) => {
        try {
            const flokkId = req.body.flokkId; // New line to get the selected flock ID
            
            const eierFlokk = await Flokk.findById(flokkId);
            
            if (!eierFlokk) {
                return res.status(404).send('Flock not found');
            }

            const newReinsdyr = {
                serieNummer: req.body.serieNummer,
                navn: req.body.navn,
                fødselsdato: req.body.fødselsdato
            };

            eierFlokk.reinsdyr.push(newReinsdyr);
            await eierFlokk.save();

            res.redirect('/index');
        } catch (err) {
            console.error('Error registering reindeer:', err);
            res.status(500).send('Error registering reindeer: ' + err.message);
        }
    }
};

module.exports = ReinsdyrController;
