process.env.NODE_ENV = "mocha";

var mongoose = require("mongoose");
var request = require("supertest");
const { expect } = require("chai");
var app = require("../app");
const moment = require("moment");

const Trabajo = require("../model/Trabajo");

let clinicas;
let piezas;
let colores;

let usuario;
let paciente;
let trabajo;

function anError(res) {
  if (res.body.error) throw new Error(res.body.error);
}
var authHeader;

before(done => mongoose.connection.once("open", done));

describe("conectar al servidor", function() {
  it("servidor iniciado", done => {
    request(app)
      .get("/")
      .expect(200, done);
  });
  it("iniciar sesion", function(done) {
    request(app)
      .post("/auth")
      .auth(authHeader)
      .send({
        usuario: "admin",
        clave: "1234"
      })
      .expect("Content-Type", /json/)
      .expect(anError)
      .end((err, res) => {
        if (err) return done(err);
        authHeader = {
          Authorization: `Bearer ${res.body.token}`
        };
        done();
      });
  });
});
describe("leyendo extras", () => {
  it("clinicas", () => {
    request(app)
      .get("/extras/clinicas")
      .set(authHeader)
      .expect(200)
      .expect(anError)
      .then(res => (clinicas = res.body));
  });
  it("piezas", () => {
    request(app)
      .get("/extras/dientes")
      .set(authHeader)
      .expect(200)
      .expect(anError)
      .then(res => (piezas = res.body));
  });
  it("colores", () => {
    request(app)
      .get("/extras/colores")
      .set(authHeader)
      .expect(200)
      .expect(anError)
      .then(res => (colores = res.body));
  });
});
describe("verificando usuarios", function() {
  it("registrar usuario", function registrarUsuario(done) {
    request(app)
      .post("/auth/registrar")
      .send({
        usuario: "nuevousuario",
        clave: "12345",
        nombre: "nombre",
        correo: "correo@gmail.com",
        telefono: "58123456789",
        tipo: "admin"
      })
      .expect(200)
      .expect(anError)
      .then(res => {
        usuario = res.body;
        done();
      });
  });
  it("buscar usuario", function buscarUsuario() {
    request(app)
      .get(`/usuario/${usuario._id}`)
      .set(authHeader)
      .expect(200)
      .expect(anError);
  });
  it("cambiar clave", () => {
    request(app)
      .get(`/auth/cambioclave?usuario=${usuario._id}&clave=123456`)
      .set(authHeader)
      .expect(200)
      .expect(anError);
  });
});
describe("verificando pacientes", () => {
  const edicion = {
    nombre: "Paciente",
    rut: "123",
    direccion: "otra direccion",
    edad: 1
  };
  it("registrar paciente", done => {
    request(app)
      .post("/paciente/nuevo")
      .set(authHeader)
      .send({
        nombre: "Nombre Paciente",
        rut: "123456789",
        direccion: "direccion",
        clinica: clinicas[0]._id,
        usuario: usuario._id,
        edad: 99
      })
      .expect(200)
      .expect(anError)
      .then(res => {
        paciente = res.body;
        done();
      });
  });
  it("buscar paciente", () => {
    request(app)
      .get(`/paciente/${paciente._id}`)
      .set(authHeader)
      .expect(200)
      .expect(anError);
  });
  it("editar paciente", done => {
    request(app)
      .post(`/paciente/editar/${paciente._id}`)
      .set(authHeader)
      .send(edicion)
      .expect(200)
      .expect(anError)
      .then(res => done());
  });
  it("edicion exitosa", done => {
    request(app)
      .get(`/paciente/${paciente._id}`)
      .set(authHeader)
      .expect(200)
      .expect(anError)
      .end((err, res) => {
        expect(res.body.nombre).to.equal("Paciente");
        expect(res.body.rut).to.equal("123");
        expect(res.body.edad).to.equal(1);
        done();
      });
  });
});
describe("verificando trabajos", () => {
  it("guardar trabajo", done => {
    request(app)
      .post("/trabajo/nuevo")
      .set(authHeader)
      .send({
        pedido: moment().format(),
        entrada: moment().format(),
        salida: moment().format(),
        tipo: "ORDEN",
        color: colores[0].nombre,
        diente: piezas[0].nombre,
        clinica: clinicas[0].nombre,
        paciente: paciente._id,
        doctor: usuario._id,
        observacion: "observacion",
        precio: 123456,
        materiales: "material1,material2"
      })
      .expect(200)
      .expect(anError)
      .then(res => {
        trabajo = res.body;
        done();
      });
  });
  it(`leer trabajo`, () => {
    request(app)
      .get(`/trabajo/${trabajo._id}`)
      .set(authHeader)
      .expect(200)
      .expect(anError);
  });
  it('cambiar estado a "progreso"', done => {
    request(app)
      .post("/trabajo/cambiar_estado")
      .set(authHeader)
      .send({
        trabajo: trabajo._id,
        estado: "progreso"
      })
      .expect(200)
      .expect(anError)
      .then(res => done());
  });
  it('cambiar estado a "terminado"', done => {
    request(app)
      .post("/trabajo/cambiar_estado")
      .set(authHeader)
      .send({
        trabajo: trabajo._id,
        estado: "terminado"
      })
      .expect(200)
      .expect(anError)
      .then(res => done());
  });
  it('cambiar estado a "entregado"', done => {
    request(app)
      .post("/trabajo/cambiar_estado")
      .set(authHeader)
      .send({
        trabajo: trabajo._id,
        estado: "entregado"
      })
      .expect(200)
      .expect(anError)
      .then(res => done());
  });
  it("leer mensajes", () => {
    request(app)
      .get(`/trabajo/mensajes/${trabajo._id}`)
      .set(authHeader)
      .expect(200)
      .expect(anError);
  });
});
describe("reportes", () => {
  it("reporte es un array", done => {
    request(app)
      .get(`/reporte?desde=2020-01-01&hasta=2020-12-31`)
      .set(authHeader)
      .expect(200)
      .expect(anError)
      .end((err, res) => {
        expect(res.body).to.be.an("array");
        done();
      });
  });
});
describe("eliminando registros", () => {
  it("eliminar usuario", function(done) {
    if (!usuario) this.skip();
    request(app)
      .get(`/auth/eliminar/${usuario._id}`)
      .set(authHeader)
      .expect(200)
      .expect(anError)
      .then(res => done());
  });
  it("eliminar paciente", done => {
    request(app)
      .get(`/paciente/remover/${paciente._id}`)
      .set(authHeader)
      .expect(200)
      .expect(anError)
      .then(res => done());
  });
  it("eliminar trabajo", function(done) {
    if (!trabajo) this.skip();
    Trabajo.deleteOne({ _id: trabajo._id }, err => {
      if (err) return done(err);
      done();
    });
  });
});
