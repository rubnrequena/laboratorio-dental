var express = require('express');
var router = express.Router();
var path = require('path')
var fs = require('fs')
const sharp = require('sharp');
sharp.cache(false)

const Usuario = require('../model/Usuario');
const Paciente = require('../model/Paciente');
const Archivo = require('../model/Archivo');
const Trabajo = require('../model/Trabajo');
const Mensaje = require('../model/Mensaje');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});
router.get('/buscar/:categoria', (req, res) => {
  const condicion = {
    $text: {
      $search: req.query.s
    }
  }
  switch (req.params.categoria) {
    case "trabajo":
      trabajos()
      break;
    case "usuario":
      usuarios()
      break;
    case "mensaje":
      mensajes()
      break;
    case "paciente":
      pacientes()
      break;
  }

  function pacientes() {
    const reg = {
      $regex: req.query.s,
      $options: "i"
    }
    Paciente.find({
      $or: [{
        nombre: reg
      }, {
        rut: reg
      }]
    }, 'nombre rut edad', (err, resultado) => {
      if (err) return res.json(err)
      res.json(resultado)
    })
  }

  function trabajos() {
    Trabajo.find(condicion, 'tipo color diente clinica', (err, resultado) => {
      if (err) return res.json(err)
      res.json(resultado)
    }).populate('doctor laboratorio paciente', 'nombre').lean()
  }

  function usuarios() {
    const reg = {
      $regex: req.query.s,
      $options: "i"
    }
    Usuario.find({
      $or: [{
        nombre: reg
      }, {
        correo: reg
      }, {
        telefono: reg
      }]
    }, 'nombre correo telefono', (err, resultado) => {
      if (err) return res.json(err)
      res.json(resultado)
    })
  }

  function mensajes() {
    const reg = {
      $regex: req.query.s,
      $options: "i"
    }
    Mensaje.find({
      texto: reg
    }, (err, resultado) => {
      if (err) return res.json(err)
      res.json(resultado)
    }).populate('usuario', 'nombre').populate('trabajo', 'tipo').lean()
  }
})
router.post('/upload/avatar', async function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) return res.status(400).send('No files were uploaded.');
  let file = req.files.avatar;
  //let ext = file.name.split(".").pop()
  const filePath = path.resolve(`./public/images/perfil/${req.user.usuario}`)
  await new Promise(async (resolve, reject) => {
    file.mv(filePath, async function (err) {
      if (err) return res.status(500).send(err);
      let usuario = await Usuario.findById(req.user.usuario)
      if (usuario) {
        usuario.avatar = `images/perfil/${req.user.usuario}`
        const min = filePath + "_sm"
        await usuario.save()
        await sharp(filePath)
          .resize(100, 100)
          .toFile(min)
        return resolve()
      }
    });
  });
  res.send('ok')
});

router.post('/upload/imagen', async function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) return res.status(400).send('No files were uploaded.');
  let files = req.files
  let trabajo = req.body.trabajo
  let allFiles = []
  for (const fileName in files) {
    const file = files[fileName]
    let ext = file.name.split(".").pop()
    const fileBD = new Archivo({
      trabajo,
      usuario: req.user.usuario,
      nombre: file.name,
      tamano: file.size,
      formato: ext
    })
    allFiles.push(await fileBD.save())
    const filePath = path.resolve(`./public/images/${trabajo}/${fileBD._id}`)
    const dirPath = path.dirname(filePath)
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath)
    await new Promise((resolve) => {
      file.mv(filePath, async function (err) {
        if (err) return res.status(500).send(err);
        await sharp(filePath)
          .resize(100, 100)
          .toFile(filePath + '_sm')
        return resolve()
      });
    })
  }
  res.json(allFiles)
});
router.get('/images/:trabajo', async (req, res) => {
  const imagenes = await Archivo.find({
    trabajo: req.params.trabajo
  }).lean()
  res.json(imagenes)
})
module.exports = router;