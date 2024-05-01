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
    formaPaga.push(`${element.codigo} - ${element.descricao} - ${element.desconto}`)
  });
  clientes.forEach(element => {
    cliente.push(`${element.nome} - ${element.telefone}`)
  });
  res.render('caixa', {produto, formaPaga, cliente})
})

router.get('/fecha', async (req, res) => {
  let total = ''
  const vendas = await db.selectSpecific(6, 5, '0')
  for(x = 0; x < vendas.length; x++){
    vendas[x].dataVd = vendas[x].dataVd.toLocaleString('pt-br').slice(0,10)
    vendas[x].vlorig = parseFloat(vendas[x].vlorig).toFixed(2).replace('.',',')
  }
  const soma = await db.query('select sum(vlorig) total from vendas where status = 0')
  if(vendas[0]) {
    if(soma[0].total != null){
      total = String(soma[0].total.toFixed(2)).replace('.',',')
    }
    res.render('caixa/fechaCaixa', {vendas, total})
  }else
    res.render('caixa/fechaCaixa', {msg: 'Não há vendas em aberto!', tipo: 'erro'})
})

router.get('/formPag',(req, res) => {
  res.render('caixa/formPag')
})

router.get('/saida', (req, res) => {
  res.render('caixa/saida')
})

router.get('/contasFixas', (req, res) => {
  res.render('caixa/contasFixas')
})

// Back-end
router.post('/venda', async (req, res) => {
  const {codigo} = req.body
  const dado = codigo.slice(0, -1)
  const result = await db.query(`select e.*, h.venda from estoque e left join historicoprecos h on e.id = h.idprod where e.codigo = '${dado}' order by h.id desc limit 1;`)
  res.json(result)
})

router.post('/finVenda', async (req, res) => {
  let erro = 0
  const dados = req.body
  const user = req.user[0].id
  const data = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0].split('/')
  const dtAtual = data[2]+'-'+data[1]+'-'+data[0]
  const valorT = parseFloat(dados.valorT)
  const dadosVenda = {valor: valorT.toFixed(2), desconto: dados.desconto, data: dtAtual, usuario: user, status: 0, cliente: dados.idCliente}
  await db.query('START TRANSACTION')
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
          if(upqtdeItem.affectedRows != 1){
            erro = 2
          }
        }
      }else {
        erro = 3
      }
    }
    for(y = 0; y < dados.formPg.length; y++) {
      const fpg = dados.formPg[y].split('-')
      const dadosFpg = {idVenda: regVenda[0].insertId, idFormPg: fpg[0], vlFormPg: fpg[1]}
      const regFormPg = await db.insert(7, dadosFpg)
      if(regFormPg[0].affectedRows != 1){
        erro = 4
      }
    }
  }else { 
    erro = 5
  }
  if(erro == 1 || erro == 2) {
    await db.query('ROLLBACK')
    res.json({satus: false, msg: 'Erro ao registrar itens da venda!'})
  }else if(erro == 3){
    await db.query('ROLLBACK')
    res.json({status: false, msg:`${veriQtde[0].codigo} não possue quantidade sulficiente no estoque!`})
  }else if(erro == 4){
    await db.query('ROLLBACK')
    res.json({status: false, msg: 'Erro ao registrar formas de pagamento'})
  }else if(erro == 5) {
    await db.query('ROLLBACK')
    res.json({status: false, msg: 'Erro ao registrar venda!'})
  }else if(erro == 0) {
    await db.query('COMMIT')
    res.json({status: true, msg: 'Venda registrada com sucesso!'})
  }
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
    res.json({msg: 'Caixa fechado com sucesso!', tipo: 'sucesso'})
  }else {
    res.json({tipo: 'erro', msg: 'Falha ao fechar Caixa!'})
  }
})

router.post('/pesqForm', async (req, res) => {
  const {codigo} = req.body
  const result = await db.selectSpecific(4, 1, codigo)
  res.json(result)
})

router.post('/formPag', async (req, res) => {
  const dados = req.body
  if(dados.isInsert == 'true'){
    const result = await db.insert(4, {codigo: dados.codigo, desc: dados.descricao, desconto: dados.desconto})
    if(result[0].affectedRows == 1)
      res.render('caixa/formPag', {msg: 'Dados salvos com sucesso!', tipo: 'sucesso'})
    else
      res.render('caixa/formPag', {msg: 'Falha ao salvar dados!', tipo: 'erro'})
  }else {
    const result = await db.update(4, dados.id, {codigo: dados.codigo, descricao: dados.descricao, desconto: dados.desconto})
    if(result[0].affectedRows == 1)
      res.render('caixa/formPag', {msg: 'Dados salvos com sucesso!', tipo: 'sucesso'})
    else
      res.render('caixa/formPag', {msg: 'Falha ao salvar dados!', tipo: 'erro'})
  }
})

router.post('/saida', async (req, res) => {
  const dados = req.body
  const user = req.user[0].id
  const data = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0].split('/')
  const dtAtual = data[2]+'-'+data[1]+'-'+data[0]
  dados.vlSaida = dados.vlSaida.replace('.','').replace(',','.')
  const result = await db.insert(10, {motivo: dados.motivo, valor: dados.vlSaida, data: dtAtual, usuario: user})
  if(result[0].affectedRows == 1){
    res.render('caixa/menu',{tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
  }else {
    res.render('caixa/saida',{tipo: 'erro', msg: 'Falha ao salvar dados!'})
  }
})

router.post('/contasFixas', async (req, res) => {
  const dados = req.body
  const user = req.user[0].id
  const data = dados.dataCF.split('/')
  const dtEUA = `${data[2]}-${data[1]}-${data[0]}`
  const valor = dados.valorCF.replace('.','').replace(',','.')
  const result = await db.insert(11, {desc: dados.descricao, data: dtEUA, valor: valor, usuario: user})
  if(result[0].affectedRows == 1)
    res.render('caixa/contasFixas', {tipo: 'sucesso', msg: 'Dados salvos com sucesso!'})
  else
    res.render('caixa/contasFixas', {tipo: 'erro', msg: 'Falha ao salvar dados!'})
})

module.exports = router