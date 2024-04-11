const express = require('express')
const router = express.Router()
const db = require('../database/db')
// const {eAdmin} = require('../../helpers/eAdmin')

// Front-end
router.get('/', (req, res) => {
  res.render('caixa/menu')
})

router.get('/abre', async (req, res) => {
  const prod = await db.query('SELECT * FROM estoque WHERE qtde > 0')
  const clientes = await db.query('SELECT * FROM clientes')
  const formPg = await db.selectAll(4)
  let produto = []
  let formaPaga = []
  let cliente = []
  prod.forEach(element => {
    produto.push(`${element.codigo} - ${element.descricao}`)
  });
  formPg.forEach(element => {
    formaPaga.push(`${element.codigo} - ${element.descricao}`)
  });
  clientes.forEach(element => {
    cliente.push(`${element.nome} - ${element.cpf}`)
  });
  res.render('caixa', {produto, formaPaga, cliente})
})

router.get('/fecha', async (req, res) => {
  let total = ''
  const vendas = await db.selectSpecific(6, 4, '0')
  for(x = 0; x < vendas.length; x++){
    vendas[x].dataVd = vendas[x].dataVd.toLocaleString('pt-br').slice(0,10)
    vendas[x].valor = parseFloat(vendas[x].valor).toFixed(2).replace('.',',')
  }
  const soma = await db.query('select sum(valor) total from vendas where status = 0')
  if(vendas[0]) {
    if(soma[0].total != null){
      total = String(soma[0].total.toFixed(2)).replace('.',',')
    }
    res.render('caixa/fechaCaixa', {vendas, total})
  }else
    res.render('caixa/fechaCaixa', {msg: 'Não há vendas em aberto!', tipo: 'erro'})
})

// Back-end
router.post('/venda', async (req, res) => {
  const {codigo} = req.body
  const dado = codigo.slice(0, -1)
  const result = await db.selectSpecific(2, 1, dado)
  res.json(result)
})

router.post('/finVenda', async (req, res) => {
  let erro = 0
  const dados = req.body
  const user = req.user[0].id
  const data = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0].split('/')
  const dtAtual = data[2]+'-'+data[1]+'-'+data[0]
  const valorT = parseFloat(dados.vlTotal)
  const dadosVenda = {valor: valorT.toFixed(2), data: dtAtual, usuario: user, status: 0, vlorigin: parseFloat(dados.valorT).toFixed(2), cliente: dados.idCliente}
  const regVenda = await db.insert(6, dadosVenda)
  if(regVenda[0].affectedRows == 1){
    for( x = 0; x < dados.itens.length; x++){

      var veriQtde = await db.selectOneId(2, dados.itens[x][0])
      if(veriQtde[0].qtde >= dados.itens[x][3]) {
        const it = {id: dados.itens[x][0], qtde: dados.itens[x][3], idVenda: regVenda[0].insertId, valor: parseFloat(dados.itens[x][6]).toFixed(2)} 
        const regItVenda = await db.insert(5, it)
        if(regItVenda[0].affectedRows != 1) 
          erro = 1
        else {
          const qtdeAtualizada = dados.itens[x][5] - dados.itens[x][3]
          const upqtdeItem = await db.query(`UPDATE estoque SET qtde = ${qtdeAtualizada} WHERE id = ${dados.itens[x][0]}`)
          if(upqtdeItem.affectedRows != 1)
           erro = 2
        }
      }else {
        erro = 3
      }
    }
    if(erro == 1 || erro == 2) {
      await db.deleteId(6, regVenda[0].insertId)
      await db.deleteSpecific(5, 3, regVenda[0].insertId)
      res.json({satus: false, msg: 'Erro ao registrar venda!'})
    }else if(erro == 3){
      await db.deleteId(6, regVenda[0].insertId)
      await db.deleteSpecific(5, 3, regVenda[0].insertId)
      res.json({status: false, msg:`${veriQtde[0].codigo} não possue quantidade sulficiente no estoque!`})
    }else if(erro == 0) 
      res.json({status: true, msg: 'Venda registrada com sucesso!'})
  }else res.json({status: false, msg: 'Erro ao registrar venda!'})
})

router.post('/qtdeEstoque', async (req, res) => {
  const {codigo} = req.body
  const dado = codigo.slice(0, -1)
  const qtdeProd = await db.selectSpecific(2, 1, dado)
  res.json(qtdeProd)
})

router.post('/fecha/itens', async (req, res) => {
  const venda = req.body
  const dado = Object.values(venda).toString()
  const itens = await db.query(`select e.codigo, e.descricao, i.qtdeitem, i.valor as valorItem, v.* from vendas v left join itensvendidos i on i.idvenda = v.id left join estoque e on i.iditem = e.id where v.status = 0 and v.id = ${dado};`)
  res.json(itens)
})

router.post('/fecha/caixa', async (req, res) => {
  const result = await db.query(`update vendas set status = 1 where status = 0`)
  if(result.affectedRows > 0 ){
    res.json({tipo: 'sucesso', msg: 'Caixa fechado com sucesso!'})
  }else {
    res.json({tipo: 'erro', msg: 'Falha ao fechar Caixa!'})
  }
})

module.exports = router