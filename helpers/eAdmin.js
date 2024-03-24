module.exports = {
  eAdmin: function(req, res, next) {
    if(req.isAuthenticated() && req.user[0].eadmin == 1) return next()
    req.flash('error_msg', 'Acesso negado!')
    res.render('caixa', {tipo: 'erro', msg: 'acesso negado'})
  }
}