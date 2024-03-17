module.exports = {
  eAdmin: function(req, res, next) {
    if(req.isAuthenticated() && req.user.eadmin == 1) return next()
    req.flash('error_msg', 'Acesso negado!')
    res.redirect('/login')
  }
}