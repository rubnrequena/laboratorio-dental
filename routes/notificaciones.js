var express = require('express');
var router = express.Router();

const Notificacion = require('../model/Notificacion')

router.get('/noleidas', async (req, res) => {
  const notificaciones = await Notificacion.find({
    usuario: req.user.usuario,
    leido: false
  }).lean()
  Notificacion.updateMany({
    usuario: req.user.usuario
  }, {
    leido: true
  })
  res.json(notificaciones)
})
router.get('/todas', async (req, res) => {
  const notificaciones = await Notificacion.find({
    usuario: req.user.usuario
  }).lean()
  res.json(notificaciones)
})


module.exports = router