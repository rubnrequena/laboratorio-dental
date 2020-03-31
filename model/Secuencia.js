const mongoose = require('mongoose');
const esquema = new mongoose.Schema({
  trabajo: Number
})
module.exports = mongoose.model('Sencuencia', esquema)