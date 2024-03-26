module.exports = {
  eAdmin: function(req, res, next) {
    if(req.isAuthenticated()){
      if(req.user[0].eadmin == 1){
         return next()
      }else {
        req.flash('error_msg', 'Acesso negado!')
        res.redirect('back')
      }
    }else {
      res.redirect('/login')
    }
  }
}