const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: String,
  correo: String,
  telefono: String,
  registrado: Date
})
module.exports = mongoose.model('Doctor', esquema)