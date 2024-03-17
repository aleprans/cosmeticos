const express = require('express')
const router = express.Router()
const db = require('../database/db')

router.get('/', async (req, res) => {
  const rows = await db.selectAll(2)
  let descricao = []
  rows.forEach(element => {
    descricao.push(`${element.codigo} - ${element.descricao}`)
  });
  res.render('caixa', {descricao, rows})
})

module.exports = router