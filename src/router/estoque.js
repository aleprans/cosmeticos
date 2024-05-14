const express = require('express')
const router = express.Router()
const db = require('../database/db')

//Front-end

router.get('/',(req, res) => {
  res.render('estoque/menu')
})

router.post('/listAll', async (req, res) => {
  const rows = await db.selectAll(2)
  res.json(rows)
})

router.post('/list', async (req, res) => {
  const rows = await db.query('SELECT * FROM estoque WHERE qtde > 0;')
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
  const qtdeAnterior = dados.qtde ? dados.qtde : 0
  const qtdeAtualizada = parseInt(qtdeAnterior) + parseInt(dados.qtdeInsert)
  const qtdeInsert = dados.qtdeInsert
  const custo = parseFloat(dados.custo.replace('.','').replace(',','.'))
  const idForn = parseInt(dados.idForn)
  const venda = parseFloat(dados.venda.replace('.','').replace(',','.')).toFixed(2)
  await db.query('START TRANSACTION; ')
  const result = await db.updateSpecific(2, id, 5, qtdeAtualizada)
  if(result[0].affectedRows == 1) {
    const resp = await db.insert(3, {codigo: dados.codigo, qtde: qtdeInsert, data: dtAtual, user, tipo: 1, fornecedor: idForn, nota: dados.nota, motivo: null, valor: custo})
    if(resp[0].affectedRows == 1) {
      if(dados.custoOrig == '' || dados.custoOrig != dados.custo ) {
        const result = await db.insert(8, {prod: dados.id, data: dtAtual, valor: custo, lucro: dados.lucro, venda: venda, idmovi: resp[0].insertId})
        if(result[0].affectedRows == 1) {
          await db.query('COMMIT')
          res.render('estoque/entrada', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
        }else {
          await db.query('ROLLBACK')
          res.render('estoque/entrada', {tipo: 'erro', msg: 'Falha ao salvar historico de preços!'})
        }
      }else { 
        await db.query('COMMIT')
        res.render('estoque/entrada', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})  
      }
    }else {
      await db.query('ROLLBACK')
      res.render('estoque/entrada', {tipo: 'erro', msg: 'Falha ao salvar movimentação do estoque!'})
    }
  }else {
    await db.query('ROLLBACK')
    res.render('estoque/entrada', {tipo: 'erro', msg: 'Falha ao atualizar quantidade no estoque!'})
  }
})

router.post('/saida', async (req, res) => {
  const user = req.user[0].id
  const dados = req.body
  const data = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0].split('/')
  const dtAtual = data[2]+'-'+data[1]+'-'+data[0]
  const qtdeAnterior = dados.qtdeEstoque
  const qtdeAtualizada = parseInt(qtdeAnterior) - parseInt(dados.qtdeSaida)
  await db.query('START TRANSACTION')
  const result = await db.updateSpecific(2, dados.id, 5, qtdeAtualizada )
  if(result[0].affectedRows == 1) {
    const resp = await db.insert(3, {codigo: dados.codigo, qtde: dados.qtdeSaida, data: dtAtual, user, tipo: 2, fornecedor: 0, nota: 0, motivo: dados.motivo, valor: 0})
    if(resp[0].affectedRows == 1) {
      await db.query('COMMIT')
      res.render('estoque/saida', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
    }else {
      await db.query('ROLLBACK')
      res.render('estoque/saida', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
    }
    await db.query('ROLLBACK')
  }else res.render('estoque/saida', {tipo: 'erro', msg: 'Erro ao salvar dados!'})
})

router.post('/pesq', async (req, res, next) => {
  const {codigo} = req.body
  const result = await db.query(`select e.*, h.id hid, h.data, h.valor, h.lucro, h.venda from estoque e left join historicoprecos h on h.idprod = e.id where e.codigo = '${codigo}' order by h.id desc limit 1;`)
  if(result)
    res.json({status: true, data: result})
  else
    res.json({status: false})
})

router.post('/cadastro', async (req, res, next) => {
  const dados = req.body
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
    res.render('estoque/cadastro', {tipo: 'erro', msg: 'Falha ao salvar dados!'})
})

module.exports = router