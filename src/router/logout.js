const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
  res.redirect('/login')
})

module.exports = router