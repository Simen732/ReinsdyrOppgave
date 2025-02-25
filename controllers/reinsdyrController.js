const IndividueltReinsdyr = require('../models/individueltReinsdyrSchema.js');
const Flokk = require('../models/FlokkSchema.js'); // Make sure to create this schema
const jwt = require('jsonwebtoken');

const ReinsdyrController = {
    RenderRegister: (req, res) => {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/auth/login');
        }
        jwt.verify(token, 'shhhhh', (err, decoded) => {
            if (err) {
                return res.redirect('/auth/login');
            }
            res.render('RegistrerReinsdyr', { userId: decoded.userId });
        });
    },

    register: async (req, res) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).send('Unauthorized: No token provided');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shhhhh');
            const eierId = decoded.eierId;
            
            const eierFlokk = await Flokk.findOne({ eier: eierId });
            
            if (!eierFlokk) {
                return res.status(404).send('Flock not found for this eier');
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
