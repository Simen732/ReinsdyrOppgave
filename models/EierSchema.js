// models/Eier.js
const { UUID } = require('bson');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
uuidv4();

// Define the eier schema
const eierSchema = new mongoose.Schema({
  navn: { type: String, required: true },
  uuid: { type: String, default: uuidv4, required: true },
  epost: { type: String, required: true },
  password: { type: String, required: true },
  kontaktsprak: { type: String, required: true },
  tellefonNummer: { type: String, required: true },
}, { collection: 'eiers' });  

// Create an Eier model
const Eier = mongoose.model('Eier', eierSchema);

module.exports = Eier;
