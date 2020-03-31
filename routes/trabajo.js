var express = require("express");
var router = express.Router();
const moment = require("moment");

const { avatarUrl } = require("../config");

const notificar = require("../control/notificaciones");

const Trabajo = require("../model/Trabajo");
const Orden = require("../model/Orden");
const Mensaje = require("../model/Mensaje");
const Archivo = require("../model/Archivo");
const Notificacion = require("../model/Notificacion");

router.post("/nuevo", (req, res) => {
  let {
    entrada,
    pedido,
    salida,
    tipo,
    color,
    diente,
    clinica,
    paciente,
    observacion,
    precio,
    materiales
  } = req.body;

  const creado = new Date();
  entrada = moment(entrada).toDate();
  pedido = moment(pedido).toDate();
  salida = moment(salida).toDate();
  tipo = tipo.trim();
  color = color.trim();
  diente = diente.trim();
  materiales = materiales.trim();
  if (observacion) observacion = observacion.trim();
  //validar doctor y clinica

  //validar paciente

  let trabajo = new Trabajo({
    creado,
    entrada,
    pedido,
    salida,
    tipo,
    color,
    diente,
    doctor: req.user.usuario,
    clinica,
    paciente,
    observacion,
    estado: "recibido",
    precio,
    materiales
  });

  trabajo.save((err, result) => {
    if (err)
      return res.json({
        error: err._message,
        msg: err.message
      });

    new Orden({
      nombre: trabajo.tipo,
      usuario: req.user.usuario
    }).save(err => {});

    notificar.trabajo.nuevo(trabajo._id, req.user);
    return res.json(result);
  });
});

router.post("/modificar", (req, res) => {
  let {
    entrada,
    pedido,
    entrega,
    tipo,
    color,
    diente,
    clinica,
    paciente,
    observacion,
    precio,
    materiales,
    _id
  } = req.body;

  entrada = moment(entrada).toDate();
  pedido = moment(pedido).toDate();
  entrega = moment(entrega).toDate();
  tipo = tipo.trim();
  color = color.trim();
  diente = diente.trim();
  materiales = materiales.trim();
  if (observacion) observacion = observacion.trim();

  Trabajo.findOneAndUpdate(
    {
      _id
    },
    {
      entrada,
      pedido,
      entrega,
      tipo,
      color,
      diente,
      materiales,
      clinica,
      observacion,
      precio
    },
    err => {
      if (err)
        return res.json({
          error: err.message
        });
      res.json(req.body);
    }
  );
});

router.get("/lista", async (req, res) => {
  let condicion = {};
  if (req.user.tipo == "doctor") condicion.doctor = req.user.usuario;
  else {
    if (req.query.doctor) condicion.doctor = req.query.doctor;
  }
  let trabajos = await Trabajo.find(condicion)
    .populate("doctor paciente")
    .lean();
  res.json(trabajos);
});

router.post("/cambiar_estado", (req, res) => {
  let { trabajo, estado } = req.body;

  Trabajo.findOne(
    {
      _id: trabajo
    },
    (err, trabajo) => {
      trabajo.estado = estado;
      if (estado === "progreso") trabajo.laboratorio = req.user.usuario;
      if (estado === "entregado") trabajo.entrega = new Date();
      trabajo.save(err => {
        if (err)
          return res.json({
            error: err.message
          });
        //ENVIAR NOTIFICACIONES POR CORREO
        notificar.trabajo
          .cambioEstado(trabajo, estado)
          .then(envioExitoso)
          .catch(envioConError);

        function envioConError(error) {
          res.json({
            ...error
          });
        }

        function envioExitoso() {
          res.json(trabajo);
        }
      });
    }
  ).populate("doctor");
});

router.post("/mensaje", (req, res) => {
  let { texto, trabajo } = req.body;
  let registrado = new Date();
  let usuario = req.user.usuario;
  let leido = false;
  new Mensaje({
    texto,
    registrado,
    trabajo,
    usuario,
    leido
  }).save((err, mensaje) => {
    if (err)
      return res.json({
        error: err
      });
    notificar.trabajo
      .comentario(trabajo, req.user)
      .then(() => res.json(mensaje))
      .catch(error => {
        let msg = Object.assign(mensaje._doc);
        res.json({
          ...msg,
          ...error
        });
      });
  });
});
router.get("/mensajes/:trabajo", async (req, res) => {
  const { trabajo } = req.params;
  let mensajes = await Mensaje.find({
    trabajo
  })
    .populate("usuario", "nombre avatar tipo")
    .lean();
  mensajes.forEach(mensaje => {
    mensaje.usuario.avatar = avatarUrl(mensaje.usuario._id, "usuario");
  });
  Notificacion.updateMany(
    {
      trabajo
    },
    {
      leido: true
    },
    (err, raw) => {
      res.json({
        mensajes,
        leidos: raw.nModified
      });
    }
  );
});
router.get("/:id", async (req, res) => {
  let trabajo = await Trabajo.findOne({
    _id: req.params.id
  })
    .populate("doctor paciente laboratorio")
    .lean();
  if (!trabajo)
    return res.json({
      error: `Trabajo '${req.params.id}' no existe`
    });
  const imagenes = await Archivo.find({
    trabajo: trabajo._id
  }).lean();

  trabajo.imagenes = imagenes;
  res.json(trabajo);
});
module.exports = router;
