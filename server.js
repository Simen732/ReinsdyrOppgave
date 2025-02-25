require('dotenv').config();

const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes.js');
const reinsdyrRoutes = require('./routes/reinsdyrRoutes.js');
const cookieParser = require('cookie-parser'); 
const Flokk = require('./models/FlokkSchema');
const Eier = require('./models/EierSchema');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/', {});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());


app.set('view engine', 'ejs');


app.use('/auth', authRoutes);
app.use('/reinsdyr', reinsdyrRoutes);


app.get(['/', '/index'], async (req, res) => {
    console.log('Route handler started');
    try {
        const search = req.query.search || '';
        const searchNumber = parseInt(search);
        const regex = new RegExp(search, 'i');

        console.log('Search query:', search);

        let query = {};
        if (search) {
            query = {
                $or: [
                    { 'reinsdyr.navn': { $regex: search, $options: 'i' } },
                    { 'reinsdyr.serieNummer': isNaN(search) ? null : Number(search) },
                    { flokkNavn: { $regex: search, $options: 'i' } },
                    { eier: { $in: await Eier.find({ navn: { $regex: search, $options: 'i' } }).distinct('_id') } }
                ]
            };
        }
        
        console.log('MongoDB query:', JSON.stringify(query));

        const flokker = await Flokk.find(query);

        console.log('Flokker found:', flokker.length);

        const reinsdyr = await Promise.all(flokker.map(async flokk => {
            const eier = await Eier.findById(flokk.eier).catch(() => ({ navn: 'Unknown', _id: null }));
            return flokk.reinsdyr
                .filter(r => 
                    search === '' || 
                    r.navn.match(regex) || 
                    (searchNumber && r.serieNummer === searchNumber) ||
                    flokk.flokkNavn.match(regex) ||
                    eier.navn.match(regex)
                )
                .map(r => ({
                    ...r.toObject(),
                    eierNavn: eier.navn,
                    flokkNavn: flokk.flokkNavn,  // Ensure this line is present
                    eierId: eier._id
                }));
        }));
        
        const flattenedReinsdyr = reinsdyr.flat().slice(0, 20);

        console.log('Reinsdyr extracted:', flattenedReinsdyr.length);

        res.render('index', { reinsdyr: flattenedReinsdyr, search });
    } catch (err) {
        console.error('Error in route handler:', err);
        res.status(500).send('Server error');
    }
});





app.get('/FAQ', (req, res) => {
    res.render('FAQ');
});

app.get('/kartSide', (req, res) => {
    res.render('kartSide');
});

app.get('/DBforklaring', (req, res) => {
    res.render('DBforklaring');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
