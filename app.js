var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const expresUpload = require("express-fileupload");

const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const mongoURL = "127.0.0.1:27017/labdental";
mongoose.connect(
  `mongodb://${mongoURL}`,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  },
  async err => {
    if (err) return console.log("Error al conectar con Mongo");
    console.log(`Conectado exitosamente con ${mongoURL}`);
  }
);

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/usuario");
var authRouter = require("./routes/auth");
var extrasRouter = require("./routes/extras");
var pacienteRouter = require("./routes/paciente");
var trabajoRouter = require("./routes/trabajo");
const notificacionRouter = require("./routes/notificaciones");
const reportesRouter = require("./routes/reporte");

var app = express();

app.use(cors());
if (process.env.NODE_ENV === "development") app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  expresUpload({
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  })
);

app.use(function(req, res, next) {
  const excluciones = ["/auth", "/auth/registrar", "/auth/recuperar"];
  let url = req.url.split("?")[0];
  const excluir = excluciones.indexOf(url) > -1;
  if (excluir) return next();

  var token = req.headers["authorization"];
  if (!token) {
    res.status(401).send({
      error: "Es necesario el token de autenticación"
    });
    return;
  }
  token = token.replace("Bearer ", "");
  jwt.verify(token, "srql4bs3cr3t", function(err, user) {
    if (err) {
      res.status(401).send({
        error: "Acceso no autorizado"
      });
    } else {
      req.user = user;
      next();
    }
  });
});

app.use("/", indexRouter);
app.use("/usuario", usersRouter);
app.use("/auth", authRouter);
app.use("/extras", extrasRouter);
app.use("/paciente", pacienteRouter);
app.use("/trabajo", trabajoRouter);
app.use("/notificaciones", notificacionRouter);
app.use("/reporte", reportesRouter);

const initFormatos = require("./control/formatos").init();

console.log("ENVIROMENT", process.env.NODE_ENV);

module.exports = app;
