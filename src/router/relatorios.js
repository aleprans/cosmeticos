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

router.get('/estoque/controle', async (req, res) => {
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const result = await db.selectAll(2)
  res.render('relatorio/estoque/controle', {layout: false, estoque: result, dtAtual}, (err, html)=> {
    if(err)
      console.log(err)
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
    console.log(err)
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

router.post('/estoque/movimentacao', async (req, res) => {
  const datas = req.body
  const dtAtual = new Date().toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  const dataIni = datas.dateIni.split('/')
  const dataFim = datas.dateFim.split('/')
  const dtIni = dataIni[2]+'-'+dataIni[1]+'-'+dataIni[0]
  const dtFim = dataFim[2]+'-'+dataFim[1]+'-'+dataFim[0]
  const result = await db.query(`select m.*, u.nome, if(m.tipo = 1, 'Entrada', 'Saida') tpmov from moviestoque m inner join usuarios u on m.usuario = u.id WHERE m.dtatual BETWEEN "${dtIni}" AND "${dtFim}" order by m.dtAtual;`)
  result.forEach(element => {
    element.dtAtual = element.dtAtual.toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
  });
  res.render('relatorio/estoque/relatorioMov', {layout: false, estoque: result, dtAtual, dtIni: datas.dateIni, dtFim: datas.dateFim}, (err, html)=> {
    if(err)
      console.log(err)
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
    res.render('relatorio/venda/venda', {msg: 'Não ha vendas para esse período', tipo: 'erro'})
  }else {
    const total = await db.query('SELECT SUM(valor) total from vendas;')
    total[0].total = total[0].total.toFixed(2)
    total[0].total = String(total[0].total).replace('.',',')
    result.forEach(element => {
      element.dataVd = element.dataVd.toLocaleString('pt-br', {timeZone: 'America/Sao_Paulo'}).split(',')[0]
      element.valor = element.valor.toFixed(2)
    });
    res.render('relatorio/venda/relatorio', {layout: false, vendas: result, dtIni: datas.dateIni, dtFim: datas.dateFim, dtAtual, total: total[0].total }, (err, html)=> {
      if(err)
        console.log(err)
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

module.exports = router