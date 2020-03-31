const fs = require('fs');
const path = require('path');

const secret = 'srql4bs3cr3t'

function baseURL(url) {
  let base = process.env.NODE_ENV == "development" ? 'http://127.0.0.1:3000' : 'http://104.238.144.19:3000'
  return `${base}/${url.trim()}`
}

function avatarUrl(img, alt) {
  const avatar = `./public/images/perfil/${img}.jpg`
  if (fs.existsSync(path.resolve(avatar))) return baseURL(`images/perfil/${img}.jpg`)
  else return baseURL(`images/perfil/${alt}.jpg`)
}

module.exports = {
  baseURL,
  avatarUrl,
  secret
};