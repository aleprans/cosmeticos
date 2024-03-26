const express = require('express')
const router = express.Router()
const db = require('../database/db')

router.get('/', async (req, res) => {
  res.render('estoque/menu')
})

router.post('/list', async (req, res) => {
  const rows = await db.selectAll(2)
  res.json(rows)
})

router.get('/insert', async (req, res) => {
  // const prod = await db.selectAll(2)
  // let produtos = []
  // prod.forEach(element => {
  //   produtos.push(`${element.codigo} - ${element.descricao}`)
  // });
  res.render('estoque/insert') //, {produtos})
})

router.post('/insert', async (req, res) => {
  const user = req.user[0].id
  const dados = req.body
  const data = new Date()
  const dtAtual = `${data.getDate()}-${data.getMonth()+1}-${data.getFullYear()}`
  const id = dados.id
  delete dados.id
  const qtdeAnterior = dados.qtde
  const qtdeAtualizada = parseInt(qtdeAnterior) + parseInt(dados.qtdeInsert)
  const qtdeInsert = dados.qtdeInsert
  delete dados.qtdeInsert
  dados.qtde = qtdeAtualizada
  const result = await db.update(2, id, dados)
  if(result[0].affectedRows == 1) {
    const resp = await db.insert(3, {codigo: dados.codigo, qtde: qtdeInsert, data: dtAtual, user})
    if(resp[0].affectedRows = 1) {
      res.render('estoque/insert', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
    }else {
      dados.qtde = qtdeAnterior
      await db.update(2, id, dados)
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
  if(result[0].affectedRows == 1){
  res.render('estoque/cadastro', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
  }else 
  res.redirect('estoque/cadastro', {tipo: 'erro', msg: 'Falha ao salvar dados!'})
})

module.exports = router