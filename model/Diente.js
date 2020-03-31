const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    unique: true
  },
  descripcion: String
})
module.exports = mongoose.model('Diente', esquema)