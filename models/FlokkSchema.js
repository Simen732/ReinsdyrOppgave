const mongoose = require('mongoose');


const flokkSchema = new mongoose.Schema({
  eier: { type: String, required: true },
  navn: { type: String, required: true },
  serieIndeling: { type: Int, required: true },
  buemerkeNavn: { type: String, required: true },
  buemerkeBilde: { type: String, required: true },
  tellefonNummer: { type: String, required: true },
}, { collection: 'flokks' });

// Create an Eier model
const Flokk = mongoose.model('Flokk', flokkSchema);

module.exports = Flokk;
