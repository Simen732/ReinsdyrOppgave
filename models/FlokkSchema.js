const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const flokkSchema = new mongoose.Schema({
  eier: { type: String, required: true },
  flokkNavn: { type: String, required: true },
  serieIndeling: { type: String, default: uuidv4, required: true },
  buemerkeNavn: { type: String, required: true },
  buemerkeBilde: { type: String, required: true },
  beiteomrade: { type: String, required: true },
  reinsdyr: [{
    serieNummer: { type: Number, required: true },
    navn: { type: String, required: true },
    fødselsdato: { type: Date, required: true }
}]
}, { collection: 'flokker' });

const Flokk = mongoose.model('Flokk', flokkSchema);

module.exports = Flokk;
