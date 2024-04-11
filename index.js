const express = require('express')
const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const db = require('./src/database/db')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
require('./config/auth')(passport)
const {authenticated} = require('./helpers/authenticated')
const {eAdmin} = require('./helpers/eAdmin')

const login = require('./src/router/login')
const clientes = require('./src/router/clientes')
const caixa = require('./src/router/caixa')
const estoque = require('./src/router/estoque')
const usuarios = require('./src/router/usuarios')
const relatorios = require('./src/router/relatorios')
const logout = require('./src/router/logout')

const app = express()
app.use(express.json())

//Sessão
app.use(session({
  secret: 'pransk',
  resave: true,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

//Variaveis globais
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.user = req.user || null
  next()
})

//body-Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//HandleBars
app.engine("handlebars", engine({defaultLayout: "main"}))
app.set("view engine", "handlebars")

//static folder
app.use(express.static(path.join(__dirname,"src/public")))

//middleware
app.use(async (req, res, next) => {
  await db.createTables()
  next()
})

//Rotas
app.use('/', login)
app.use('/login', login)
app.use('/clientes', authenticated, clientes)
app.use('/caixa', authenticated, caixa)
app.use('/estoque', authenticated, estoque)
app.use('/usuarios', authenticated, usuarios)
app.use('/relatorios', authenticated, relatorios)
app.use('/logout',  logout)

//Geral
const PORT = process.env.PORT || 1512
app.listen(PORT, () => console.log(`Server is runing in port ${PORT}`))