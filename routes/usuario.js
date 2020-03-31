var express = require("express");
var router = express.Router();
const Trabajo = require("../model/Trabajo");
const Usuario = require("../model/Usuario");
const { avatarUrl } = require("../config");

router.get("/all", async (req, res) => {
  let usuarios = await Usuario.find({}, "-clave").lean();
  res.json(usuarios);
});

router.get("/stat/:usuario", async function(req, res, next) {
  let usuario = await Usuario.findById(req.params.usuario).lean();
  res.json(await getStat(usuario));
});
async function getStat(usuario) {
  let q = {};
  switch (usuario.tipo) {
    case "doctor":
      q = {
        doctor: usuario._id
      };
      break;
    case "laboratorio":
      q = {
        laboratorio: usuario._id
      };
    default:
      break;
  }
  let global = await Trabajo.countDocuments();
  let trabajos = await Trabajo.find(q);

  let recibido = 0,
    progreso = 0,
    terminado = 0,
    cancelado = 0,
    entregado = 0;
  let total = 0,
    totalMonto = 0;

  trabajos.forEach(trabajo => {
    total++;
    totalMonto += trabajo.precio;
    switch (trabajo.estado) {
      case "recibido":
        recibido++;
        break;
      case "progreso":
        progreso++;
        break;
      case "terminado":
        terminado++;
        break;
      case "cancelado":
        cancelado++;
        break;
      case "entregado":
        entregado++;
        break;
    }
  });

  return {
    global,
    total,
    totalMonto,
    recibido,
    progreso,
    terminado,
    cancelado,
    entregado
  };
}
router.get("/:id", async (req, res) => {
  console.log("BUSCANDO USUARIO", req.params.id);
  let usuario = await Usuario.findById(req.params.id).lean();
  if (!usuario)
    return res.json({
      error: "usuario no existe"
    });
  usuario.avatar = avatarUrl(usuario._id, "usuario");
  res.json(usuario);
});

module.exports = router;
