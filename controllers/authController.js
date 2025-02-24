const Eier = require("../models/EierSchema.js");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

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

          const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

          const newEier = new Eier({
            navn: req.body.navn,
            uuid: uuidv4(),
            epost: req.body.epost,
            password: hashedPassword,
            kontaktspråk: req.body.kontaktspråk,
            tellefonNummer: req.body.tellefonNummer
          });
      
          await newEier.save();
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
                  { uuid: existingEier.uuid },
                  process.env.JWT_SECRET || 'shhhhh',
                  { expiresIn: '15m' }
                );
                res.cookie('token', token, { maxAge: 900000, httpOnly: true });
                res.render('index');
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
