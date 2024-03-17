const express = require('express')
const router = express.Router()
const {eAdmin} = require('../../helpers/eAdmin')

router.get('/', eAdmin, (req, res, next) => {
  res.render('./usuarios')
})
module.exports = router