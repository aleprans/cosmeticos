const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('./../database/db')

router.get('/', (req, res, next) => {
  res.render('./usuarios', req.user)
})

router.post('/', async (req, res) => {
  const dados = req.body
  const senhaInicial = '$2a$10$Ig8jtcwJyDm08g/KL/qAIe98JcPHGo1odyD2wyEBrJ./nCEN9PCh6'
  let result
  if(dados.isToggle == 'true'){
    if(dados.reset == 'true'){
      result = await db.query(`UPDATE usuarios SET senha = "${senhaInicial}" WHERE id = ${dados.idUsuario};`)
      if(result.affectedRows == 1){
            res.json({ status : 'sucesso', msg: 'Senha resetada com sucesso!'})
          }else {
            res.json({ status: 'erro', msg: 'Falha ao resetar senha'})
          }
    }else {
      console.log('toggle true')
      console.log(dados)
      bcrypt.genSalt(10, (erro, salt) => {
        bcrypt.hash(dados.senhaUsuario, salt, async (erro, hash) => {
          if(erro){
            res.render('usuarios', {tipo: 'erro', msg: 'Erro ao salvar usuário!'})
          }
          result = await db.query(`UPDATE usuarios SET senha = "${hash}" WHERE id = ${dados.idUsuario};`)
          if(result.affectedRows == 1){
            res.render('usuarios', {msg: 'Senha alterada com sucesso!', tipo: 'sucesso'})
          }else {
            res.render('usuarios', {msg: 'Falha ao alterar senha', tipo: 'erro'})
          }
        })
      })
    }
  }else {
    console.log('toggle false')
    dados.cpfUsuario = dados.cpfUsuario.replace(/[^0-9]/g,'')
    if(dados.nivelUsuario == 'Administrador'){
      dados.nivelUsuario = 1
    }else {
      dados.nivelUsuario = 0
    }
    if(dados.isInsert == 'true') {
      console.log('insert true')
      console.log(dados)
      delete dados.isToggle
      delete dados.isInsert
      delete dados.idUsuario
      delete dados.idUsuarioSelected
      dados.senhaUsuario = senhaInicial
      result = await db.insert(1, dados)
    }else {
      console.log('insert false')
      console.log(dados)
      result = await db.query(`UPDATE usuarios SET nome = "${dados.nomeUsuario}", cpf = "${dados.cpfUsuario}", email = "${dados.emailUsuario}", eadmin = ${dados.nivelUsuario} WHERE id = ${dados.idUsuarioSelected}`)
    }
    if(result.affectedRows == 1){
      res.render('usuarios',{msg: 'Dados salvos com sucesso!', tipo: 'sucesso'})
    }else {
      res.render('usuarios',{msg: 'Falha ao salvar dados!', tipo: 'erro'})
    }
    
  }
})

router.post('/pesqUsuario', async (req, res) => {
  const dados = req.body
  const result = await db.selectSpecific(1, 2, dados.usuario)
  if(result.length > 0){
    delete result[0].senha
    res.json({status: true, dados: result[0]})
  }else
    res.json({status: false})
})

module.exports = router