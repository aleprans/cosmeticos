const express = require('express')
const router = express.Router()
const db = require('../database/db')

router.get('/', (req, res) => {
  res.render('clientes')
})

router.post('/pesCPF', async (req, res) => {
  const dados = req.body
  const cpf = dados.cpf.replace(/[^0-9]/g,'')
  const result = await db.selectSpecific(0, 1, cpf)
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
    result = await db.insert(0, dados)
  }else {
    delete dados.isInsert
    result = await db.update(0, idCliente, dados)
  }
  if(result[0].affectedRows == 1)
    res.render('clientes', {msg: 'Dados salvos com sucesso!', tipo: 'sucesso'})
  else
    res.render('clientes', {msg: 'Falha ao salvar dados!', tipo: 'erro'})
})

router.post('/findCpf', async (req, res) => {
  const cpf = req.body
  const dados = cpf.cpf.split('-')
  const result = await db.selectSpecific(0, 1, dados[0])
  res.json({status: true, result})
})

module.exports = router