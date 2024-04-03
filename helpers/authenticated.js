module.exports = {
  authenticated: function(req, res, next) {
    if(req.isAuthenticated()) return next()

    req.flash('Error_msg', 'Acesso negado!')
    res.redirect('/login')
  }
}