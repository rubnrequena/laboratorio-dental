const mongoose = require('mongoose');
const Secuencia = require('../control/Secuencia');
const esquema = new mongoose.Schema({
  id: Number,
  creado: Date,
  entrada: Date,
  pedido: Date,
  salida: Date,
  entrega: Date,
  tipo: String,
  color: String,
  diente: String,
  clinica: String,
  observacion: String,
  materiales: String,
  precio: {
    type: Number,
    min: 0
  },
  estado: {
    type: String,
    lowercase: true,
    enum: ["recibido", "progreso", "terminado", "cancelado", "entregado"]
  },
  paciente: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Paciente'
  },
  doctor: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Usuario'
  },
  laboratorio: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Usuario'
  },
  local: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Laboratorio'
  }
})

esquema.virtual('mensajes', {
  ref: 'Mensaje',
  localField: '_id',
  foreignField: 'trabajo'
});

esquema.set('toObject', {
  virtuals: true
});
esquema.set('toJSON', {
  virtuals: true
});

esquema.index({
  '$**': 'text'
})

esquema.pre('save', async function (next) {
  if (this.isNew) this.id = await Secuencia.trabajo()
  next()
})

module.exports = mongoose.model('Trabajo', esquema)