const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  host: "mail.sistemasrq.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-responder@sistemasrq.com",
    pass: "mail-psw"
  }
});

async function enviar(para, msg, sujeto) {
  // TODO: capturar posibles errores con catch
  let info = await transport.sendMail({
    from: '"SQRLab" <no-responder@sistemasrq.com>',
    to: para,
    subject: sujeto,
    html: msg
  })
  console.log('Message sent to:', para, info.messageId);
  return info;
}

module.exports = enviar