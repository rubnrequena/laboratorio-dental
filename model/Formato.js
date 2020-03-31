const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  titulo: String,
  formato: {
    type: String,
    required: true
  }
})
module.exports = mongoose.model('Formato', esquema)