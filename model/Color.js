const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  nombre: {
    type: String,
    unique: true
  }
})
module.exports = mongoose.model('Color', esquema)