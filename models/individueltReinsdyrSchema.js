const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reinsdyrSchema = new mongoose.Schema({
  serieNummer: { type: Number, required: true, unique: true },
  navn: { type: String, default: uuidv4, required: true },
  fødselsdato: { type: Date, required: true, default: Date.now },
  flokk: { type: mongoose.Schema.Types.ObjectId, ref: 'Flokk', required: true }
}, { collection: 'individueltReinsdyr' });

const IndividueltReinsdyr = mongoose.model('IndividueltReinsdyr', reinsdyrSchema);

module.exports = IndividueltReinsdyr;
