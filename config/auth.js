const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const db = require('../src/database/db')

module.exports = function(passport) {

  async function findUser(usuario){
    const result = await db.signIn(1, usuario)
    return result
  }

  async function findUserById(id) {
    const result = await db.selectOneId(1, id)
    return result
  }

  passport.use(new localStrategy({
    usernameField: 'usuario',
    passwordField: 'senha'
  }, async (usuario, senha, done) => {
    try {
      const user = await findUser(usuario)
      if(!user) return done(null, false)

      const isValid = bcrypt.compareSync(senha, user.senha)
      if(!isValid) return done(null, false)
      return done(null, user)
    }
    catch (error) {
      console.log(error)
      done(error, false)
    }
  }))
  
  passport.serializeUser((usuario, done) => {
    done(null, usuario.id)
  })

  passport.deserializeUser(async (id, done) => {
    try{
      const user = await findUserById(id)
      done(null, user)
    } catch(err) {
      return done(err, null)
    }
  })
}