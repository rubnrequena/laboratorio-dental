var express = require("express");
var router = express.Router();

const Diente = require("../model/Diente");
const Clinica = require("../model/Clinica");
const Color = require("../model/Color");
const Usuario = require("../model/Usuario");
const Orden = require('../model/Orden')
const Formato = require('../model/Formato')

router.post("/doctor/nuevo", (req, res) => {
  let {
    nombre,
    correo,
    telefono,
    usuario,
    clave
  } = req.body;
  const registrado = new Date();
  nombre = nombre.trim()
  telefono = telefono.trim();
  correo = correo.trim()

  let doctor = new Usuario({
    nombre,
    correo,
    telefono,
    registrado,
    usuario,
    clave,
    activo: true,
    tipo: "doctor"
  });

  doctor.save(err => {
    if (err) return res.json({
      error: err.errmsg
    });
    res.json(doctor);
  });
});
router.get("/doctor/remover/:id", async (req, res) => {
  let doctor = await Usuario.findById(req.params.id);
  if (!doctor)
    return res.json({
      error: `Referencia '${req.params.id}' no existe`
    });
  doctor.remove(err => res.json(err || {
    result: 1,
    data: doctor
  }));
});
router.get("/doctores", async (req, res) => {
  let doctores = await Usuario.find({
    tipo: "doctor"
  }, 'usuario nombre correo telefono');
  res.json(doctores);
});

router.post("/clinica/nuevo", (req, res) => {
  let {
    nombre,
    direccion
  } = req.body;
  nombre = nombre.trim()
  direccion = direccion.trim()
  let clinica = new Clinica({
    nombre,
    direccion
  });

  clinica.save(err => {
    if (err) return res.json(err);
    res.json(clinica);
  });
});
router.get("/clinica/remover/:id", async (req, res) => {
  Clinica.findByIdAndRemove(req.params.id)
    .then(clinica => {
      res.json(
        !clinica ? {
          error: `la clinica con el id '${req.params.id}' no existe`
        } : {
          result: 1,
          data: clinica
        }
      );
    })
    .catch(err =>
      res.json({
        error: err.message
      })
    );
});
router.get("/clinicas", async (req, res) => {
  let clinicas = await Clinica.find();
  res.json(clinicas);
});

router.post("/color/nuevo", (req, res) => {
  let {
    nombre
  } = req.body;
  nombre = nombre.toUpperCase().trim();

  let nuevo = new Color({
    nombre
  });
  nuevo.save(err => {
    if (err) {
      if (err.errmsg) res.json({
        error: err.errmsg
      });
      else res.json(err);
    } else res.json(nuevo);
  });
});
router.get("/color/remover/:id", async (req, res) => {
  Color.findByIdAndRemove(req.params.id)
    .then(color => {
      res.json(
        !color ? {
          error: `el color con el id '${req.params.id}' no existe`
        } : {
          result: 1,
          data: color
        }
      );
    })
    .catch(err =>
      res.json({
        error: err.message
      })
    );
});
router.get("/colores", async (req, res) => {
  let colores = await Color.find().catch(err =>
    res.json({
      error: err.message
    })
  );
  if (colores) res.json(colores);
});

router.post("/diente/nuevo", (req, res) => {
  let {
    nombre
  } = req.body;
  nombre = nombre.toLowerCase().trim();

  let nuevo = new Diente({
    nombre
  });
  nuevo.save(err => {
    if (err) {
      if (err.errmsg) res.json({
        error: err.errmsg
      });
      else res.json(err);
    } else res.json(nuevo);
  });
});
router.get("/diente/remover/:id", async (req, res) => {
  Diente.findByIdAndRemove(req.params.id)
    .then(diente => {
      res.json(
        !diente ? {
          error: `el diente con el id '${req.params.id}' no existe`
        } : {
          result: 1,
          data: diente
        }
      );
    })
    .catch(err =>
      res.json({
        error: err.message
      })
    );
});
router.get("/dientes", async (req, res) => {
  let dientes = await Diente.find().catch(err =>
    res.json({
      error: err.message
    })
  );
  if (dientes) res.json(dientes);
});

router.get('/ordenes', async (req, res) => {
  if (req.user.tipo == "doctor") res.json(await Orden.find({
    usuario: req.user.usuario
  }))
  else res.json(await Orden.find())
})

router.get('/formatos', async (req, res) => {
  const formatos = await Formato.find().lean()
  res.json(formatos)
})
router.post('/formato/guardar', async (req, res) => {
  let {
    nombre,
    titulo,
    formato,
    _id
  } = req.body
  formato = formato.split('\n').join('<br>')
  if (_id) await actualizar()
  else await nuevo()

  async function nuevo() {
    let nvo = new Formato({
      nombre,
      titulo,
      formato
    }).save()
    res.json(nvo)
  }

  async function actualizar() {
    let nvoFormato = await Formato.findOneAndUpdate({
      nombre
    }, {
      titulo,
      formato
    }).lean()
    res.json(nvoFormato)
  }
})
router.get('/formato/:id', async (req, res) => {
  res.json(await Formato.findById(req.params.id).lean())
})

module.exports = router;