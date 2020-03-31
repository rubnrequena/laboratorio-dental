var express = require("express");
var router = express.Router();
const moment = require("moment");

const Trabajo = require("../model/Trabajo");

router.get("/", (req, res) => {
  let { desde, hasta } = req.query;
  Trabajo.find(
    {
      creado: {
        $gte: moment(desde).toDate(),
        $lte: moment(hasta).toDate()
      }
    },
    (err, result) => {
      res.json(result);
    }
  )
    .populate("paciente doctor", "nombre")
    .lean();
});

module.exports = router;
