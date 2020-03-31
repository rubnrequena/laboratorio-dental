const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  trabajo: mongoose.SchemaTypes.ObjectId,
  nombre: String,
  peso: Number,
  formato: String,
  usuario: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Usuario'
  },
})
module.exports = mongoose.model('Archivo', esquema)