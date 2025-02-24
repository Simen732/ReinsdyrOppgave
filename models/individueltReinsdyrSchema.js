const mongoose = require('mongoose');


const flokkSchema = new mongoose.Schema({
  serieNummer: { type: Int, required: true },
  navn: { type: String, default: uuidv4, required: true },
  flokk: { type: String, required: true },
  fødselsdato: { type: Date, required: true },
}, { collection: 'individueltReinsdyr' });


const Flokk = mongoose.model('Flokk', flokkSchema);

module.exports = Flokk;
