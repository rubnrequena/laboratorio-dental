const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  direccion: String,
  registrado: Date,
  rut: {
    type: String,
    unique: true
  },
  doctor: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Usuario'
  },
  clinica: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Clinica'
  },
})

module.exports = mongoose.model('Paciente', esquema)