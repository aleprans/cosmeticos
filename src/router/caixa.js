const express = require('express')
const router = express.Router()
const db = require('../database/db')

router.get('/', async (req, res) => {
  const prod = await db.query('SELECT * FROM estoque WHERE qtde > 0')
  const formPg = await db.selectAll(4)
  let produto = []
  let formaPaga = []
  prod.forEach(element => {
    produto.push(`${element.codigo} - ${element.descricao}`)
  });
  formPg.forEach(element => {
    formaPaga.push(`${element.codigo} - ${element.descricao}`)
  });
  res.render('caixa', {produto, formaPaga})
})

router.post('/venda', async (req, res) => {
  const {codigo} = req.body
  const dado = codigo.slice(0, -1)
  const result = await db.selectSpecific(2, 1, dado)
  res.json(result)
})

router.post('/finVenda', async (req, res) => {
  let erro = 0
  const dados = req.body
  const user = (req.user[0].id)
  const data = new Date()
  const dtAtual = `${data.getDate()}-${data.getMonth()+1}-${data.getFullYear()}`
  const dadosVenda = {valor: dados.valorT, data: dtAtual, usuario: user}
  const regVenda = await db.insert(6, dadosVenda)
  if(regVenda[0].affectedRows == 1){
    for( x = 0; x < dados.itens.length; x++){

      var veriQtde = await db.selectOneId(2, dados.itens[x][0])
      if(veriQtde[0].qtde >= dados.itens[x][3]) {
        const it = {id: dados.itens[x][0], qtde: dados.itens[x][3], idVenda: regVenda[0].insertId} 
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
module.exports = router