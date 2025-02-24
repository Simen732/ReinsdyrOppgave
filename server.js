require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes.js');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/', {});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


app.set('view engine', 'ejs');


app.use('/auth', authRoutes);


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/index', (req, res) => {
    res.render('index');
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
