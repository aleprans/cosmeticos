const express = require('express')
const router = express.Router()
const db = require('../database/db')

// front-end
router.get('/', (req, res) => {
  res.render('financeiro/menu')
})

// bach-end


module.exports = router