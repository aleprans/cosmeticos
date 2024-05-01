const express = require('express')
const router = express.Router()
const db = require('../database/db')

router.get('/', (req, res) => {
  res.render('fornecedores')
})

router.post('/pesqForn', async (req, res) => {
  const dados = req.body
  const tel = dados.tel.replace(/[^0-9]/g,'')
  const result = await db.selectSpecific(9, 2, tel)
  if(result.length > 0)
    res.json({status: true, dados: result})
  else
    res.json({status: false})
})

router.post('/', async (req, res) => {
  const dados = req.body
  dados.tel = dados.tel.replace(/[^0-9]/g,'')
  let result  = []
  if(dados.isInsert == 'true')
    result = await db.insert(9, {nome: dados.nome, tel: dados.tel, cont: dados.contato })
  else 
    result = await db.update(9, dados.idForn, {nome: dados.nome, tel: dados.tel, cont: dados.contato})

  if(result[0].affectedRows == 1)
    res.render('fornecedores', {msg: 'Dados salvos com sucesso!', tipo: 'sucesso'})
  else
    res.render('fornecedores', {msg: 'Falha ao salvar dados!', tipo: 'erro'})
})

router.post('/list', async (req, res) => {
  const result = await db.selectAll(9)
  res.json(result)
})

module.exports = router