const mail = require('../mail')

const Notificacion = require('../model/Notificacion')
const Formato = require('../model/Formato')
const Usuario = require('../model/Usuario')
const Trabajo = require('../model/Trabajo')
const moment = require('moment')
const {
  FORMATOS
} = require('../control/formatos')

function prepararFormato(str, data, usuario) {
  const mapa = {
    "usuario": usuario.nombre,
    "usuario.correo": usuario.correo,
    "usuario.tipo": usuario.tipo,
    "hoy": moment().format('d/M/Y'),
    "ahora": moment().format(),
    "id": data._id,
    "doctor": data.doctor.nombre,
    "doctor.correo": data.doctor.correo,
    "pieza": data.diente,
    "creado": data.creado ? moment(data.creado).format('d/M/Y') : '--',
    "entrada": data.entrada ? moment(data.entrada).format('d/M/Y') : '--',
    "pedido": data.pedido ? moment(data.pedido).format('d/M/Y') : '--',
    "salida": data.salida ? moment(data.salida).format('d/M/Y') : '--',
    "entrega": data.entrega ? moment(data.entrega).format('d/M/Y') : '--',
    "orden": data.tipo,
    "color": data.color,
    "pieza": data.diente,
    "clinica": data.clinica,
    "materiales": data.materiales,
    "observacion": data.observacion,
    "estado": data.estado,
    "paciente": data.paciente.nombre,
    "paciente.rut": data.paciente.rut,
    "paciente.edad": data.paciente.edad,
    "laboratorio": data.laboratorio ? data.laboratorio.nombre : '--',
  }
  for (const llave in mapa) {
    const item = mapa[llave];
    str = str.split(`{${llave}}`).join(item)
  }
  return str
}
async function validarFormato(nombre) {
  let formato = await Formato.findOne({
    nombre
  })
  if (!formato) {
    return {
      error: `El formato '${nombre}' no esta registrado`
    }
  }
  return formato
}

module.exports = {
  trabajo: {
    nuevo(trabajoID, usuario) {
      return new Promise(async (resolve, reject) => {
        let formato = await validarFormato(FORMATOS.trabajo.NUEVO)
        if (formato.error) return reject(formato)

        let trabajo = await Trabajo.findById(trabajoID).populate('doctor paciente laboratorio')
        let descripcion = prepararFormato(formato.formato, trabajo, usuario)
        let titulo = prepararFormato(formato.titulo, trabajo, usuario)

        //notificar a todos los laboratorios
        let labs = await Usuario.find({
          tipo: 'laboratorio'
        })
        labs.forEach((lab) => {
          new Notificacion({
            fechaHora: new Date(),
            titulo,
            descripcion,
            usuario: lab._id,
            trabajo: trabajo._id,
            leido: false
          }).save((err) => {
            if (err) return reject(err)
            mail(lab.correo, descripcion, titulo)
            resolve()
          })
        })
      })
    },
    cambioEstado(trabajoID, usuario) {
      return new Promise(async (resolve, reject) => {
        let formato = await validarFormato(FORMATOS.trabajo.CAMBIO_ESTADO)
        if (formato.error) return reject(formato)

        const trabajo = await Trabajo.findById(trabajoID).populate('doctor paciente laboratorio')
        if (trabajo) {
          if (!trabajo.doctor.correo) return reject({
            error: 'Doctor no tiene correo asociado, imposible enviar notificación'
          })
          // TODO: capturar errores al enviar mail
          const notificacion = {
            fechaHora: new Date(),
            titulo: prepararFormato(formato.titulo, trabajo, usuario),
            descripcion: prepararFormato(formato.formato, trabajo, usuario),
            usuario: trabajo.doctor._id,
            trabajo: trabajo._id,
            leido: false
          }
          new Notificacion(notificacion).save((err => {
            if (err) return reject(err)
            mail(trabajo.doctor.correo, notificacion.descripcion, notificacion.titulo)
            resolve()
          }))
        } else return reject({
          error: `Trabajo ${trabajoID} no existe`
        })
      })
    },
    comentario(trabajoID, usuario) {
      return new Promise(async (resolve, reject) => {
        let formato = await validarFormato(FORMATOS.trabajo.COMENTARIO)
        if (formato.error) return reject(formato)

        const trabajo = await Trabajo.findById(trabajoID).populate('doctor paciente laboratorio').lean()
        if (trabajo) {
          if (!trabajo.doctor.correo) return reject({
            error: 'Doctor no tiene correo asociado, imposible enviar notificación'
          })

          const destino = usuario.tipo === "doctor" ? trabajo.laboratorio : trabajo.doctor
          if (!destino) return reject({
            error: 'El destinatario no existe'
          })

          const notificacion = {
            fechaHora: new Date(),
            titulo: prepararFormato(formato.titulo, trabajo, usuario),
            descripcion: prepararFormato(formato.formato, trabajo, usuario),
            usuario: destino._id,
            trabajo: trabajo._id,
            tipo: 'mensaje',
            leido: false
          }
          new Notificacion(notificacion).save((err => {
            if (err) return reject(err)
            mail(destino.correo, notificacion.descripcion, notificacion.titulo)
            resolve()
          }))
        } else return reject({
          error: `Trabajo ${trabajoID} no existe`
        })
      })
    }
  }
}