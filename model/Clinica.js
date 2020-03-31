const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    unique: true
  },
  direccion: String
})
module.exports = mongoose.model('Clinica', esquema)