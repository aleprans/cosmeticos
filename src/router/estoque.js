const express = require('express')
const router = express.Router()
const db = require('../database/db')

router.get('/', async (req, res) => {
  res.render('estoque/menu')
})

router.get('/list', async (req, res) => {
  const rows = await db.selectAll(3)
  res.render('estoque/list', {rows})
})

router.get('/insert', (req, res) => {
  res.render('estoque/insert')
})

router.post('/insert', async (req, res) => {
  const dados = req.body
  const data = new Date()
  const dtAtual = `${data.getDate()}-${data.getMonth()+1}-${data.getFullYear()}`
  const id = dados.id
  const qtdeAnterior = dados.qtde
  delete dados.id
  const qtdeAtualizada = parseInt(dados.qtde) + parseInt(dados.qtdeInsert)
  dados.qtde = qtdeAtualizada
  const result = await db.update(2, id, dados)
  if(result[0].affectedRows == 1) {
    let dados2 = {}
    dados2.codigo = dados.codigo
    dados2.qtde = dados.qtdeInsert
    dados2.data = dtAtual
    const resp = await db.insert(3, dados2)
    if(resp[0].affectedRows = 1) {
      res.render('estoque/insert', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
    }else {
      dados.qtde = qtdeAnterior
      const result = await db.update(2, id, dados)
      res.redirect('estoque/insert', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
    }
  }else res.redirect('estoque/insert', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
})

router.get('/cadastro', (req, res) => {
  res.render('estoque/cadastro')
})

router.post('/pesq', async (req, res, next) => {
  const {codigo} = req.body
  const result = await db.selectSpecific(2, 1, codigo)
  res.json(result)
})

router.post('/cadastro', async (req, res, next) => {
  const dados = req.body
  let result
  if(dados.isSave == 'true'){
    delete dados.id
    delete dados.isSave
    if(dados.qtde > 0)
    result = await db.insert(2, dados)
  else {
    dados.qtde = 0
    result = await db.insert(2, dados)
  }
  }else{
    delete dados.isSave
    const id = dados.id
    delete dados.id
    result = await db.update(2, id, dados)
  } 
  if(result[0].affectedRows == 1)
  res.render('estoque/cadastro', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
  else 
  res.redirect('estoque/cadastro', {tipo: 'erro', msg: 'Falha ao salvar dados!'})
})

module.exports = router