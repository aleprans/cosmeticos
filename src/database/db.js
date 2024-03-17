const connectionDb = require('./connection')

async function connect(){
  if(global.connection && global.connection.state !== 'disconnected') return global.connection
    const mysql = require('mysql2/promise')
    const connection = await mysql.createConnection(connectionDb.mysqlURI)
    global.connection = connection
    return connection
}

async function createTables() {
  const conn = await connect()
  const TableClientes = 'CREATE TABLE IF NOT EXISTS clientes ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'nome varchar(255) NOT NULL,'+
    'cpf varchar(11) NOT NULL,'+
    'endereco varchar(255),'+
    'telefone varchar(11),'+
    'email varchar(255),'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(TableClientes)
  
  const tableUsuario = 'CREATE TABLE IF NOT EXISTS usuarios ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'usuario varchar(8) NOT NULL,'+
    'nome varchar(255) NOT NULL,'+
    'cpf varchar(11) NOT NULL,'+
    'email varchar(255) NOT NULL,'+
    'senha varchar(255) NOT NULL,'+
    'eadmin int DEFAULT 0,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(tableUsuario)
  
  const tableEstoque = 'CREATE TABLE IF NOT EXISTS estoque ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'codigo varchar(12) NOT NULL,'+
    'descricao varchar(255) NOT NULL,'+
    'fabricante varchar(255) NOT NULL,'+
    'custo varchar(18) NOT NULL,'+
    'lucro varchar(6) NOT NULL,'+
    'venda varchar(20) NOT NULL,'+
    'qtde int DEFAULT 0,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(tableEstoque)

  const moviEstoque = 'CREATE TABLE IF NOT EXISTS moviEstoque ('+
    'id int NOT NULL AUTO_INCREMENT,'+
    'codigo varchar(12) NOT NULL,'+
    'qtde int DEFAULT 0,'+
    'dtAtual varchar(10) ,'+
    'PRIMARY KEY (id)'+
    ')'
  await conn.query(moviEstoque)
  
  return 
}

const tabelas = [
  ['clientes','nome', 'cpf', 'endereco', 'telefone', 'email'],
  ['usuarios', 'usuario', 'nome', 'cpf', 'email', 'senha', 'eadmin'],
  ['estoque', 'codigo', 'descricao', 'fabricante', 'qtde', 'custo', 'lucro', 'venda'],
  ['moviEstoque', 'codigo', 'qtde', 'dtAtual']
]

async function signIn(tab, usuario) {
  const conn = await connect()
  const sql = 'SELECT * FROM ' +tabelas[tab][0]+' WHERE usuario = ? '
  const params = [usuario]
  const [rows] = await conn.query(sql, params)
  return rows[0]
}

async function selectSpecific(tab, campo, dado) {
  const conn = await connect()
  const sql = 'SELECT * FROM '+tabelas[tab][0]+' WHERE '+tabelas[tab][campo]+' = ? ;'
  const params = [dado]
  const [rows] = await conn.query(sql, params)
  return rows
}

async function selectAll(tab){
  const conn = await connect()
  const sql = "Select * from " +tabelas[tab][0]
  const [rows] = await conn.query(sql)
  return rows
}

async function selectOneId(tab, id){
  const conn = await connect()
  const sql = "Select * from " +tabelas[tab][0]+ " where id = ?"
  const values = [id]
  const [rows] = await conn.query(sql, values)
  return rows
}

async function insert(tab, dados){
  let dado = Object.values(dados).join("','")
  const conn = await connect()
  const campos = tabelas[tab].slice(1).join()
  const sql = "INSERT INTO " +tabelas[tab][0]+ " ("+campos+ ") VALUES ('"+dado+"')"
  return await conn.query(sql)
}

async function update(tab, id, dados){
  const arrDados = Object.values(dados)
  const conn = await connect()
  const campos = tabelas[tab].slice(1)
  let param = []
  for(let i = 0; i < campos.length ; i++){
    param[i] = campos[i] + ' = "'+arrDados[i]+'"'
  }
  const params = param.join(",")
  const sql = "UPDATE " +tabelas[tab][0]+" SET "+params+" WHERE ID = ?"
  const values = [id]
  return await conn.query(sql, values)
}

async function deleteId(tab, id){
  const conn = await connect()
  const sql = "DELETE FROM " +tabelas[tab][0]+ " WHERE id = ?"
  const values = [id]
  return await conn.query(sql, values)
}


module.exports = {createTables, signIn, selectAll, selectOneId, selectSpecific, insert, update, deleteId}