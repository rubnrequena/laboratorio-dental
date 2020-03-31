const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: String,
  direccion: String,
  telefono: String,
  responsable: String
});

module.exports = mongoose.model('Laboratorio', esquema)