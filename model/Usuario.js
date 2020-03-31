const mongoose = require('mongoose');
const md5 = require('md5');

const esquema = new mongoose.Schema({
  usuario: {
    type: String,
    unique: true
  },
  clave: String,
  tipo: {
    type: String,
    enum: ['admin', 'doctor', 'laboratorio', 'asistente']
  },
  nombre: String,
  registrado: Date,
  activo: Boolean,
  correo: String,
  telefono: String,
  avatar: {
    type: String,
    default: 'images/perfil/usuario.jpg'
  },
})

esquema.pre('save', function (next) {
  if (this.isModified("clave")) this.clave = md5(this.clave)
  next()
})
module.exports = mongoose.model('Usuario', esquema)