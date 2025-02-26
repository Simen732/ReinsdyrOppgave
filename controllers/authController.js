require('dotenv').config();
const Eier = require("../models/EierSchema.js");
const Flokk = require("../models/FlokkSchema.js");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const saltRounds = parseInt(process.env.SALT_ROUNDS);
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiryTime = process.env.JWT_EXPIRY_TIME;
const cookieMaxAge = parseInt(process.env.COOKIE_MAX_AGE); 

const authController = {

    RenderRegister: (req, res) => {
        res.render('register');
    },

    register: async (req, res) => {
        try {
            if (req.body.password !== req.body.repeatPassword) {
                return res.send('Passwords do not match');
            }
            
            const existingEier = await Eier.findOne({ epost: req.body.epost });
            if (existingEier) {
                return res.send('Denne eposten er allerede i bruk');
            }
    
            // if (!req.file) {
            //     return res.status(400).send('No file uploaded');
            // }
    
            console.log(req.body);
    
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    
            // const eieruuid = uuidv4();

            const newEier = new Eier({
                navn: req.body.navn,
                uuid: uuidv4(),
                epost: req.body.epost,
                password: hashedPassword,
                kontaktsprak: req.body.kontaktsprak,
                tellefonNummer: req.body.tellefonNummer
            });
        
            await newEier.save();
    
            // const newFlokk = new Flokk({
            //     eier: newEier._id,
            //     flokkNavn: req.body.flokkNavn,
            //     serieIndeling: uuidv4(),
            //     buemerkeNavn: req.body.buemerkeNavn,
            //     buemerkeBilde: req.file.filename,
            //     beiteomrade: req.body.beiteomrade, // Add this line to capture the value
            //     reinsdyr: [] // Initialize an empty array for reinsdyr            
            //   });
    
            // await newFlokk.save();
    
            // Create a JWT token for the new eier
            const token = jwt.sign({ eierId: newEier._id }, 'shhhhh', { expiresIn: '1h' });
    
            // Set the token as a cookie
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiry
    
            res.render('login');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error saving eier');
        }
    },
    
    

    RenderLogin: (req, res) => {
        res.render('login');
    },  
        login: async (req, res) => {
            try {
                const existingEier = await Eier.findOne({ epost: req.body.epost });
                if (!existingEier) {
                    return res.send('En bruker med den eposten kunne ikke bli funnet');
                }
                
                if (await bcrypt.compare(req.body.password, existingEier.password)) {
                    const token = jwt.sign(
                        { eierId: existingEier._id },
                        jwtSecret,
                        { expiresIn: jwtExpiryTime }
                    );
        
                    res.cookie('token', token, { maxAge: cookieMaxAge, httpOnly: true });
        
                    res.redirect('/');
                } else {
                    return res.send('Wrong email or password');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Login error');
            }
        }
    };    
module.exports = authController;