const Formato = require('../model/Formato')

const formatos = {
  trabajo: {
    NUEVO: 'trabajo_nuevo',
    CAMBIO_ESTADO: 'trabajo_estado',
    COMENTARIO: 'trabajo_comentario'
  }
}

module.exports = {
  init() {
    registrarFormato(formatos.trabajo.CAMBIO_ESTADO, 'Trabajo cambió de estado a: {estado}', `
Estado: {estado}<br>
Usuario: {doctor}<br>
Paciente: {paciente}<br>
Laboratorio: {laboratorio}<br>
    <h3><a href="http://sistemasrq.com/lab/#/trabajo/{id}">Ir al Trabajo</a></h3>`);
    registrarFormato(formatos.trabajo.NUEVO, 'Hay un nuevo trabajo', `
Doctor: {doctor}
<h3>Paciente</h3>
Paciente: {paciente} <br>
RUT: {paciente.rut}<br>
Edad: {paciente.edad}<br>
<h3>Trabajo</h3>
Orden: {orden}<br>
Pedido: {pedido}<br>
Entrada: {entrada}<br>
Salida: {salida}<br>
Materiales: {materiales}<br>
Observacion: {observacion}<br>
<h3><a href="http://sistemasrq.com/lab/#/trabajo/{id}">Ir al Trabajo</a></h3>`);
    registrarFormato(formatos.trabajo.COMENTARIO, 'Tiene un nuevo mensaje de {usuario}', `<b>{usuario}</b> le ha enviado un nuevo mensaje para el trabajo <b>{orden}</b>
<h3><a href="http://sistemasrq.com/lab/#/trabajo/{id}">Ir al Trabajo</a></h3>`);
  },
  FORMATOS: formatos
}

async function registrarFormato(nombre, titulo, formato) {
  let trabajo_completo = await Formato.findOne({
    nombre
  })
  if (!trabajo_completo) {
    new Formato({
      nombre,
      titulo,
      formato
    }).save()
  }
}