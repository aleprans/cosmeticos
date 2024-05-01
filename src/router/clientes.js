const express = require('express')
const router = express.Router()
const db = require('../database/db')

router.get('/', (req, res) => {
  res.render('clientes')
})

router.post('/pesTel', async (req, res) => {
  const dados = req.body
  const tel = dados.tel.replace(/[^0-9]/g,'')
  const result = await db.selectSpecific(0, 5, tel)
  if(result.length > 0)
    res.json({status: true, dados: result[0]})
  else
    res.json({status: false})
})

router.post('/', async (req, res) => {
  const dados = req.body
  dados.cpf = dados.cpf.replace(/[^0-9]/g,'')
  dados.telCliente = dados.telCliente.replace(/[^0-9]/g,'')
  const idCliente = dados.idCliente
  delete dados.idCliente
  let result = []
  if(dados.isInsert === true){
    delete dados.isInsert
    result = await db.insert(0, {cpf: dados.cpf, nome: dados.nome, email: dados.email, end: dados.endereco, tel: dados.telCliente})
  }else {
    delete dados.isInsert
    result = await db.update(0, idCliente, {cpf: dados.cpf, nome: dados.nome, email: dados.email, end: dados.endereco, tel: dados.telCliente})
  }
  if(result[0].affectedRows == 1)
    res.render('clientes', {msg: 'Dados salvos com sucesso!', tipo: 'sucesso'})
  else
    res.render('clientes', {msg: 'Falha ao salvar dados!', tipo: 'erro'})
})

module.exports = router