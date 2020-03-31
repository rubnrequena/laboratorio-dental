const mongoose = require('mongoose');

let esquema = new mongoose.Schema({
  texto: String,
  registrado: Date,
  trabajo: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Trabajo'
  },
  usuario: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Usuario'
  },
  leido: Boolean,
  leidoFecha: Date
})

esquema.index({
  texto: 'text'
})

module.exports = mongoose.model('Mensaje', esquema)