const express = require('express')
const router = express.Router()
const db = require('../database/db')

//Front-end

router.get('/',(req, res) => {
  res.render('estoque/menu')
})

router.post('/list', async (req, res) => {
  const rows = await db.selectAll(2)
  res.json(rows)
})

router.get('/entrada', async (req, res) => {
  res.render('estoque/entrada')
})

router.get('/saida', (req, res) => {
  res.render('estoque/saida')
})

router.get('/cadastro', (req, res) => {
  res.render('estoque/cadastro')
})

//Back-end
router.post('/entrada', async (req, res) => {
  const user = req.user[0].id
  const dados = req.body
  const data = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0].split('/')
  const dtAtual = data[2]+'-'+data[1]+'-'+data[0]
  const id = dados.id
  delete dados.id
  const qtdeAnterior = dados.qtde
  const qtdeAtualizada = parseInt(qtdeAnterior) + parseInt(dados.qtdeInsert)
  const qtdeInsert = dados.qtdeInsert
  delete dados.qtdeInsert
  dados.qtde = qtdeAtualizada
  const fornecedor = dados.fornecedor
  delete dados.fornecedor
  const nota = dados.nota
  delete dados.nota
  dados.tipo = 1
  dados.custo = dados.custo.replace(',','.')
  dados.venda = dados.venda.replace(',','.')
  const result = await db.update(2, id, dados)
  if(result[0].affectedRows == 1) {
    const resp = await db.insert(3, {codigo: dados.codigo, qtde: qtdeInsert, data: dtAtual, user, tipo: 1, fornecedor: fornecedor, nota: nota, motivo: null})
    if(resp[0].affectedRows == 1) {
      res.render('estoque/entrada', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
    }else {
      dados.qtde = qtdeAnterior
      await db.update(2, id, dados)
      res.redirect('estoque/entrada', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
    }
  }else res.redirect('estoque/entrada', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
})

router.post('/saida', async (req, res) => {
  const user = req.user[0].id
  const dados = req.body
  const data = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0].split('/')
  const dtAtual = data[2]+'-'+data[1]+'-'+data[0]
  const qtdeAnterior = dados.qtdeEstoque
  const qtdeAtualizada = parseInt(qtdeAnterior) - parseInt(dados.qtdeSaida)
  dados.tipo = 2
  const result = await db.updateSpecific(2, dados.id, 4, qtdeAtualizada )
  if(result[0].affectedRows == 1) {
    const resp = await db.insert(3, {codigo: dados.codigo, qtde: dados.qtdeSaida, data: dtAtual, user, tipo: 2, fornecedor: null, nota: null, motivo: dados.motivo})
    if(resp[0].affectedRows == 1) {
      res.render('estoque/saida', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
    }else {
      dados.qtde = qtdeAnterior
      await db.update(2, id, dados)
      res.redirect('estoque/saida', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
    }
  }else res.redirect('estoque/saida', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
})


router.post('/pesq', async (req, res, next) => {
  const {codigo} = req.body
  const result = await db.selectSpecific(2, 1, codigo)
  if(result.length > 0) {
    result[0].custo = String(result[0].custo.toFixed(2)).replace('.',',')
    result[0].venda = String(result[0].venda.toFixed(2)).replace('.',',')
  }
  res.json(result)
})


router.post('/cadastro', async (req, res, next) => {
  const dados = req.body
  dados.custo = dados.custo.replace(',','.')
  dados.venda = dados.venda.replace(',','.')
  let result
  if(dados.isSave == 'true'){
    delete dados.id
    delete dados.isSave
    dados.qtde = 0
    result = await db.insert(2, dados)
  }else{
    const rows = await db.selectSpecific(2, 1, dados.codigo)
    dados.qtde = rows[0].qtde
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