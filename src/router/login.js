const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get('/', async (req, res) => {
  if(req.query.fail)
    res.render('login', {message: 'Usuário e/ou senha inválidos!'})
  else
    res.render('login', { message: null})
})

router.post('/', passport.authenticate('local', {
  successRedirect: '/caixa',
  failureRedirect: '/login?fail=true',
  failureFlash: true  
}))

module.exports = router