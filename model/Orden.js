const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    unique: true
  },
  usuario: mongoose.SchemaTypes.ObjectId,
  descripcion: String
})
module.exports = mongoose.model('Orden', esquema)