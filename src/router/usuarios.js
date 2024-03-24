const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('./../database/db')

router.get('/', (req, res, next) => {
  res.render('./usuarios')
})

router.post('/', async (req, res) => {
  var dados = req.body
  const cpf = dados.cpf.replace(/[^0-9]/g,'')
  dados.cpf = cpf
  if(dados.nivel == 'Administrador'){
    dados.nivel = 1
  }else {
    dados.nivel = 0
  }

  bcrypt.genSalt(10, (erro, salt) => {
    bcrypt.hash(dados.senha, salt, async (erro, hash) => {
      if(erro){
        res.render('usuarios', {tipo: 'erro', msg: 'Erro ao salvar usuario!'})
      }
      dados.senha = hash
      const result = await db.insert(1, dados)
      if(result[0].affectedRows == 1)
        res.render('usuarios', {msg: 'Cadastro realizado com sucesso!', tipo: 'sucesso'})
      else
        res.render('usuarios', {msg: 'Falha ao salvar cadastro!', tipo: 'erro'})
    })
  })
})

module.exports = router