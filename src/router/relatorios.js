const express = require('express')
const router = express.Router()
const db = require('../database/db')
const pdf = require('html-pdf')
const fs = require('fs')
const {eAdmin} = require('../../helpers/eAdmin')

router.get('/', (req, res) => {
  res.render('relatorio/menu')
})

router.get('/venda', eAdmin, (req, res) => {
  res.render('relatorio/venda')
})

router.get('/historico', eAdmin, (req, res) => {
  res.render('relatorio/historico')
})

router.get('/fornecedor', eAdmin, (req, res) => {
  res.render('relatorio/fornecedor')
})

router.get('/estoque/controle', async (req, res) => {
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const result = await db.selectAll(2)
  res.render('relatorio/estoque/controle', {layout: false, estoque: result, dtAtual}, (err, html)=> {
    if(err)
      resposta(false)
    else {
      pdf.create(html).toFile(`./src/public/PDFs/estoqueContr.pdf`,(err, res) => {
        if(err)
          resposta(false)
        else
          if(fs.existsSync(res.filename)){
            resposta(true, res)
          }
      })
    }
  })
  function resposta(status, resp = ''){
    if(!status){
      req.flash('error_msg', 'Falha ao gerar relatório!')
      res.redirect('/relatorios')
    }else{
      let file = resp.filename
      res.sendFile(file)
    }
  }
})

router.get('/estoque/movimentacao', eAdmin, (req, res) => {
  res.render('relatorio/movimentacao')
})

router.get('/estoque/qtdeMin', async (req, res) => {
const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
const result = await db.query('SELECT * FROM estoque WHERE qtde <= qtdeMin;')
res.render('relatorio/estoque/qtdeMin', {layout: false, estoque: result, dtAtual}, (err, html)=> {
  if(err){
    resposta(false)
  }else {
    pdf.create(html).toFile(`./src/public/PDFs/estoqueqtdeMin.pdf`,(err, res) => {
      if(err)
        resposta(false)
      else
        if(fs.existsSync(res.filename)){
          resposta(true, res)
        }
    })
  }
})
function resposta(status, resp = ''){
  if(!status){
    req.flash('error_msg', 'Falha ao gerar relatório!')
    res.redirect('/relatorios')
  }else{
    let file = resp.filename
    res.sendFile(file)
  }
}
})

router.get('/lucro', (req, res) => {
  res.render('relatorio/lucro')
})

router.get('/conta', (req, res) => {
  res.render('relatorio/contas')
})

router.post('/estoque/movimentacao', async (req, res) => {
  const datas = req.body
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const dataIni = datas.dateIni.split('/')
  const dataFim = datas.dateFim.split('/')
  const dtIni = dataIni[2]+'-'+dataIni[1]+'-'+dataIni[0]
  const dtFim = dataFim[2]+'-'+dataFim[1]+'-'+dataFim[0]
  const result = await db.query(`select m.*, u.nome, if(m.tipo = 1, 'Entrada', 'Saida') tpmov, f.fornecedor from moviestoque m inner join usuarios u on m.usuario = u.id LEFT JOIN fornecedores f ON m.fornecedor = f.id WHERE m.dtatual BETWEEN "${dtIni}" AND "${dtFim}" order by m.dtAtual;`)
  result.forEach(element => {
    element.dtAtual = element.dtAtual.toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  });
  res.render('relatorio/estoque/relatorioMov', {layout: false, estoque: result, dtAtual, dtIni: datas.dateIni, dtFim: datas.dateFim}, (err, html)=> {
    if(err)
      resposta(false)
    else {
      pdf.create(html).toFile(`./src/public/PDFs/estoqueMov.pdf`,(err, res) => {
        if(err)
          resposta(false)
        else
          if(fs.existsSync(res.filename)){
            resposta(true, res)
          }
      })
    }
  })
  function resposta(status, resp = ''){
    if(!status){
      req.flash('error_msg', 'Falha ao gerar relatório!')
      res.redirect('/relatorios')
    }else{
      let file = resp.filename
      res.sendFile(file)
    }
  }
})

router.post('/venda', async (req, res) => {
  const datas = req.body
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const dataIni = datas.dateIni.split('/')
  const dataFim = datas.dateFim.split('/')
  const dtIni = dataIni[2]+'-'+dataIni[1]+'-'+dataIni[0]
  const dtFim = dataFim[2]+'-'+dataFim[1]+'-'+dataFim[0]
  const result = await db.query(`SELECT v.*, u.nome from vendas v left join usuarios u on v.usuario = u.id WHERE v.datavd BETWEEN "${dtIni}" AND "${dtFim}";`)
  if(result.length  == 0){
    res.render('relatorio/venda', {msg: 'Não ha vendas para esse período', tipo: 'erro'})
  }else {
    const total = await db.query(`SELECT SUM(vlorig) total from vendas WHERE datavd BETWEEN "${dtIni}" AND "${dtFim}";`)
    total[0].total = total[0].total.toFixed(2)
    total[0].total = String(total[0].total).replace('.',',')
    result.forEach(element => {
      element.dataVd = element.dataVd.toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
      element.valor = element.valor.toFixed(2)
    });
    res.render('relatorio/venda/relatorio', {layout: false, vendas: result, dtIni: datas.dateIni, dtFim: datas.dateFim, dtAtual, total: total[0].total }, (err, html)=> {
      if(err)
        res.render('relatorio/venda', {msg: 'Erro ao gerar relatório!', tipo: 'erro'})
      else {
        pdf.create(html).toFile(`./src/public/PDFs/vendas.pdf`,(err, res) => {
          if(err)
            resposta(false)
          else
            if(fs.existsSync(res.filename)){
              resposta(true, res)
            }
        })
      }
    })
  }

  function resposta(status, resp = ''){
    if(!status){
      req.flash('error_msg', 'Falha ao gerar relatório!')
      res.redirect('/relatorios')
    }else{
      let file = resp.filename
      res.sendFile(file)
    }
  }
})

router.post('/lucro', async (req, res) => {
  const datas = req.body
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const dataIni = datas.dateIni.split('/')
  const dataFim = datas.dateFim.split('/')
  const dtIni = dataIni[2]+'-'+dataIni[1]+'-'+dataIni[0]
  const dtFim = dataFim[2]+'-'+dataFim[1]+'-'+dataFim[0]
  const lucro = await db.query(`SELECT SUM(vlorig) liquido from vendas WHERE dataVd BETWEEN '${dtIni}' AND '${dtFim}';`)
  const lucroBt = String(lucro[0].liquido.toFixed(2)).replace('.',',')
  const custo = await db.query(` select idprod, valor, data from historicoprecos where id in (select max(id) from historicoprecos group by idprod)`) 
  const qtde = await db.query(`select iditem, sum(qtdeitem) qtde from itensvendidos where idvenda in (select id from vendas where datavd between '${dtIni}' and '${dtFim}') group by iditem;`)

  let calculo = 0
  qtde.forEach(item => {
    custo.forEach(cust => {
      if(item.iditem == cust.idprod)
      calculo += (item.qtde * cust.valor)
  })
})
const lucroLq = String((lucro[0].liquido - calculo).toFixed(2)).replace('.',',')
  res.render('relatorio/venda/lucro', {layout: false, lucroLq: lucroLq, lucroBt: lucroBt, dtIni: datas.dateIni, dtFim: datas.dateFim, dtAtual }, (err, html)=> {
    if(err){
    console.log(err)
      res.render('relatorio/lucro', {msg: 'Erro ao gerar relatório!', tipo: 'erro'})
    }else {
      pdf.create(html).toFile(`./src/public/PDFs/lucro.pdf`,(err, res) => {
        if(err){
          console.log(err)
          resposta(false)
        }else
          if(fs.existsSync(res.filename)){
            resposta(true, res)
          }
      })
    }
  })

  function resposta(status, resp = ''){
    if(!status){
      req.flash('error_msg', 'Falha ao gerar relatório!')
      res.redirect('/relatorios')
    }else{
      let file = resp.filename
      res.sendFile(file)
    }
  }
})

router.post('/fornecedor', async (req, res) => {
  const dados = req.body
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const dataIni = dados.dateIni.split('/')
  const dataFim = dados.dateFim.split('/')
  const dtIni = dataIni[2]+'-'+dataIni[1]+'-'+dataIni[0]
  const dtFim = dataFim[2]+'-'+dataFim[1]+'-'+dataFim[0]
  const fornecedor = dados.fornecedor.split('-')
  const result = await db.query(`SELECT m.codigo, m.qtde, REPLACE(FORMAT(m.valor,2),'.',',') as valor, DATE_FORMAT(m.dtatual,"%d/%m/%Y") as data, e.descricao FROM moviestoque m LEFT JOIN estoque e ON e.codigo = m.codigo WHERE m.fornecedor = ${fornecedor[2]} AND m.dtatual BETWEEN '${dtIni}' AND '${dtFim}' AND m.tipo = 1 ORDER BY m.codigo`)

  const total = await db.query(`select REPLACE(FORMAT(SUM(valor),2),'.',',') total from moviestoque where fornecedor = ${fornecedor[2]} and dtatual between '${dtIni}' AND '${dtFim}' AND tipo = 1;`)
  res.render('relatorio/fornecedor/fornecedor', {layout: false, fornecedor: `${fornecedor[0]} - ${fornecedor[1]}`, dtIni: dados.dateIni, dtFim: dados.dateFim, dtAtual, dados: result, total: total[0].total }, (err, html)=> {
    if(err){
    console.log(err)
      res.render('relatorio/lucro', {msg: 'Erro ao gerar relatório!', tipo: 'erro'})
    }else {
      pdf.create(html).toFile(`./src/public/PDFs/fornecedor.pdf`,(err, res) => {
        if(err){
          console.log(err)
          resposta(false)
        }else
          if(fs.existsSync(res.filename)){
            resposta(true, res)
          }
      })
    }
  })

  function resposta(status, resp = ''){
    if(!status){
      req.flash('error_msg', 'Falha ao gerar relatório!')
      res.redirect('/relatorios')
    }else{
      let file = resp.filename
      res.sendFile(file)
    }
  }
})

router.post('/conta', async (req, res) => {
  const dados = req.body
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const dataIni = dados.dateIni.split('/')
  const dataFim = dados.dateFim.split('/')
  const dtIni = dataIni[2]+'-'+dataIni[1]+'-'+dataIni[0]
  const dtFim = dataFim[2]+'-'+dataFim[1]+'-'+dataFim[0]
  const result = await db.query(`select descricao, DATE_FORMAT(data,"%d/%m/%Y") data, REPLACE(REPLACE(REPLACE(FORMAT(valor,2),',','-'),'.',','),'-','.') valor from contasfixas where data between '${dtIni}' AND '${dtFim}' order by data;`)

  const total = await db.query(`SELECT REPLACE(REPLACE(REPLACE(FORMAT(SUM(valor),2),',','-'),'.',','),'-','.') total FROM contasfixas WHERE data between '${dtIni}' AND '${dtFim}';`)
  res.render('relatorio/venda/conta', {layout: false, dtIni: dados.dateIni, dtFim: dados.dateFim, dtAtual, dados: result, total: total[0].total }, (err, html)=> {
    if(err){
    console.log(err)
      res.render('relatorio/conta', {msg: 'Erro ao gerar relatório!', tipo: 'erro'})
    }else {
      pdf.create(html).toFile(`./src/public/PDFs/conta.pdf`,(err, res) => {
        if(err){
          console.log(err)
          resposta(false)
        }else
          if(fs.existsSync(res.filename)){
            resposta(true, res)
          }
      })
    }
  })

  function resposta(status, resp = ''){
    if(!status){
      req.flash('error_msg', 'Falha ao gerar relatório!')
      res.redirect('/relatorios')
    }else{
      let file = resp.filename
      res.sendFile(file)
    }
  }
})

router.post('/historico', async (req, res) => {
  let hist = []
  const dados = req.body
  const codProd = dados.codProd
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const dataIni = dados.dateIni.split('/')
  const dataFim = dados.dateFim.split('/')
  const dtIni = dataIni[2]+'-'+dataIni[1]+'-'+dataIni[0]
  const dtFim = dataFim[2]+'-'+dataFim[1]+'-'+dataFim[0]
  if(codProd == 'todos'){
    hist = await db.query(`SELECT e.descricao, DATE_FORMAT(h.data, "%d/%m/%Y") dataf, replace(replace(replace(format(h.valor, 2), '.','-'), ',','.'), '-',',') valorf, f.fornecedor, f.contato  from historicoprecos h inner join estoque e on h.idprod =  e.id left join moviestoque m on h.idmovi = m.id left join fornecedores f on f.id = m.fornecedor WHERE data BETWEEN '${dtIni}' AND '${dtFim}' order by e.descricao, h.data;`)
  }else {
      hist = await db.query(`SELECT e.descricao, DATE_FORMAT(h.data, "%d/%m/%Y") dataf, replace(replace(replace(format(h.valor, 2), '.','-'), ',','.'), '-',',') valorf, f.fornecedor, f.contato  from historicoprecos h inner join estoque e on h.idprod =  e.id left join moviestoque m on h.idmovi = m.id left join fornecedores f on f.id = m.fornecedor WHERE data BETWEEN '${dtIni}' AND '${dtFim}' and e.codigo = '${codProd}' order by h.data;`)
  }
  res.render('relatorio/estoque/historico', {layout: false, dtIni: dados.dateIni, dtFim: dados.dateFim, dtAtual, dados: hist, }, (err, html)=> {
    if(err){
    console.log(err)
      res.render('relatorio/historico', {msg: 'Erro ao gerar relatório!', tipo: 'erro'})
    }else {
      pdf.create(html).toFile(`./src/public/PDFs/historico.pdf`,(err, res) => {
        if(err){
          console.log(err)
          resposta(false)
        }else
          if(fs.existsSync(res.filename)){
            resposta(true, res)
          }
      })
    }
  })

  function resposta(status, resp = ''){
    if(!status){
      req.flash('error_msg', 'Falha ao gerar relatório!')
      res.redirect('/relatorios')
    }else{
      let file = resp.filename
      res.sendFile(file)
    }
  }
})
module.exports = router