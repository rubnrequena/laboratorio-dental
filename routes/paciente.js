var express = require("express");
var router = express.Router();

const Paciente = require("../model/Paciente");
const Trabajo = require("../model/Trabajo");

router.post("/nuevo", (req, res) => {
  let { nombre, rut, direccion, clinica, edad } = req.body;
  const registrado = new Date();
  let paciente = new Paciente({
    nombre,
    rut,
    direccion,
    registrado,
    doctor: req.user.usuario,
    clinica,
    edad
  });
  paciente.save(err => {
    if (err)
      return res.json({
        error: err._message
      });
    res.json(paciente);
  });
});
router.get("/remover/:id", (req, res) => {
  Paciente.findOneAndDelete({ _id: req.params.id }, (err, presult) => {
    if (err) return res.json({ error: err });
    Trabajo.deleteMany({ paciente: req.params.id }, (err, tresult) => {
      res.json({
        res: true,
        id: presult._id,
        trabajos: tresult.deletedCount
      });
    });
  });
});
router.get("/lista", async (req, res) => {
  if (req.user.tipo == "admin") {
    res.json(await Paciente.find().populate("doctor clinica", "nombre"));
  } else if (["doctor", "asistente"].includes(req.user.tipo)) {
    const pacientes = await Paciente.find({
      doctor: req.user.usuario
    }).populate("clinica", "nombre");
    res.json(pacientes);
  }
});
router.post("/editar/:id", async (req, res) => {
  Paciente.updateOne({ _id: req.params.id }, req.body, async err => {
    if (err) return res.json({ error: err._message });
    const paciente = await Paciente.findById(req.params.id).lean();
    res.json(paciente);
  });
});
router.get("/:id", async (req, res) => {
  const paciente = await Paciente.findById(req.params.id)
    .populate("doctor clinica", "nombre")
    .lean();
  res.json(paciente);
});

module.exports = router;
