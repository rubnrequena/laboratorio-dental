var express = require("express");
var router = express.Router();
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");

const Usuario = require("../model/Usuario");

Usuario.find({}).countDocuments((err, count) => {
  if (count == 0) {
    new Usuario({
      usuario: "admin",
      clave: "1234",
      nombre: "Administrador",
      activo: true,
      correo: "rubnrequena@gmail.com",
      telefono: "584149970167",
      tipo: "admin"
    }).save(err => console.log("Usuario Administrador registrado con exito"));
  }
});

router.post("/", (req, res) => {
  let { usuario, clave } = req.body;
  usuario = usuario.trim().toLowerCase();
  clave = md5(clave.trim());
  Usuario.findOne(
    {
      usuario
    },
    "-respuesta -__v",
    (err, usuario) => {
      if (err) return res.json(err);
      if (!usuario) return res.json({ error: "usuario no existe" });
      if (usuario.clave != clave)
        return res.json({ error: "contraseña no coincide" });
      if (!usuario.activo) return res.json({ error: "usuario inactivo" });
      else {
        var token = jwt.sign(
          {
            usuario: usuario._id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            tipo: usuario.tipo
          },
          secret,
          {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
          }
        );
        delete usuario.clave;
        res.json({
          usuario,
          token
        });
      }
    }
  ).lean();
});
router.post("/registrar", (req, res) => {
  let { usuario, clave, nombre, correo, telefono, tipo } = req.body;
  const registrado = new Date();
  const activo = true;

  usuario = usuario.trim().toLowerCase();
  clave = clave.trim();
  nombre = nombre.trim();

  new Usuario({
    avatar: "images/perfil/usuario.jpg",
    usuario,
    clave,
    nombre,
    registrado,
    activo,
    correo,
    telefono,
    tipo
  })
    .save()
    .then(usuario => res.json(usuario))
    .catch(err => res.json({ error: err.errmsg }));
});
router.get("/eliminar/:usuario", (req, res) => {
  Usuario.deleteOne({ _id: req.params.usuario }, err => {
    if (err)
      return res.json({
        error: "usuario no eliminado"
      });
    res.json("ok");
  });
});
router.get("/recuperar", async (req, res) => {
  let { correo } = req.query;
  correo = correo
    .toString()
    .trim()
    .toLowerCase();
  let usuario = await Usuario.findOne({
    correo
  });
  if (!usuario)
    return res.json({
      err: "Usuario no registrado"
    });

  let nuevaClave = generarClave(5);
  usuario.clave = nuevaClave;
  await usuario.save();
  res.json({
    nuevaClave
  });
  //enviar correo o whatsapp

  function generarClave(length) {
    var result = "";
    var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
});
router.get("/cambioclave", async (req, res) => {
  let usuario = await Usuario.findById(req.query.usuario);
  if (usuario) {
    if (req.user.tipo == "admin" || usuario._id == req.user.usuario) {
      usuario.clave = req.query.clave;
      usuario.save(err => {
        if (err)
          return res.json({
            error: "Ocurrio un error al cambiar la contraseña"
          });
        res.json({
          ok: 1
        });
      });
    }
  }
});
router.get("/cambiocontacto", (req, res) => {
  let { telefono, correo } = req.query;
  Usuario.findByIdAndUpdate(
    req.user.usuario,
    {
      telefono,
      correo
    },
    err => {
      if (err)
        return res.json({
          error: "ocurrio un error al cambiar datos de contacto"
        });
      res.json({
        ok: 1
      });
    }
  );
});
module.exports = router;
