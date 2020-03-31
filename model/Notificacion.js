const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  fechaHora: Date,
  descripcion: String,
  titulo: String,
  leido: Boolean,
  tipo: {
    type: String,
    enum: ['notificacion', 'mensaje'],
    default: 'notificacion'
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  trabajo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trabajo'
  }
})
module.exports = mongoose.model('Notificacion', esquema)