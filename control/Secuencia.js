const Secuencia = require('../model/Secuencia');
var secuencias;
//MEJORAR: administrar secuencias diferentes por cada usuario
Secuencia.findOne(async (err, res) => {
  if (!res) {
    secuencias = new Secuencia({
      trabajo: 1,
      usuario: 1,
      paciente: 1,
    })
    await secuencias.save()
  } else secuencias = res
  //console.log('Correlativos :', secuencias);
})

async function trabajo() {
  const proximoValor = secuencias.trabajo + 1
  secuencias.trabajo = proximoValor
  await secuencias.save()
  return proximoValor
}

module.exports = {
  trabajo
}